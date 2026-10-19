import { supabaseAdmin } from '../lib/supabase.js'
import { googleCalendar } from '../lib/google.js'
import { AppError } from '../utils/error.js'

const PAYMENT_EXPIRY_MS = 15 * 60e3

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

// FE shape: { id, orderId, method, status, amount, qrPayload, expiresAt }.
// qrPayload/expiresAt are computed (fake QRIS), not stored columns.
const formatPayment = (p) => ({
  id: p.id,
  orderId: p.order_id,
  method: p.method,
  status: p.status,
  amount: p.amount,
  qrPayload: `qris:${p.id}`,
  expiresAt: new Date(new Date(p.created_at).getTime() + PAYMENT_EXPIRY_MS).toISOString(),
})

// Payment milik player ini? Join sekali jalan supaya id orang lain = "not found".
const findPlayerPayment = async (paymentId, playerId) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('id, order_id, method, status, amount, created_at, order:orders!inner(player_id)')
    .eq('id', paymentId)
    .eq('order.player_id', playerId)
    .maybeSingle()
  if (error) throw dbError(error)
  return data
}

export const paymentController = {
  // POST /orders/:id/payment (player pemilik order)
  create: async (c) => {
    const user = c.get('user')
    const { id: orderId } = c.req.valid('param')

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, total_price')
      .eq('id', orderId)
      .eq('player_id', user.id)
      .maybeSingle()
    if (orderError) throw dbError(orderError)
    if (!order) throw new AppError('Order tidak ditemukan', 404)

    // Idempoten: order yang belum dibayar pakai payment pending yang sama.
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('payments')
      .select('id, order_id, method, status, amount, created_at')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .maybeSingle()
    if (existingError) throw dbError(existingError)
    if (existing) return c.json(formatPayment(existing), 200)

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .insert({ order_id: orderId, method: 'qris', status: 'pending', amount: order.total_price })
      .select('id, order_id, method, status, amount, created_at')
      .single()
    if (error) throw dbError(error)

    return c.json(formatPayment(payment), 201)
  },

  // GET /payments/:id (player pemilik order; dipoll halaman QRIS)
  getById: async (c) => {
    const user = c.get('user')
    const { id } = c.req.valid('param')

    const payment = await findPlayerPayment(id, user.id)
    if (!payment) throw new AppError('Payment tidak ditemukan', 404)

    return c.json(formatPayment(payment), 200)
  },

  // POST /payments/:id/finish (player pemilik order; tombol fake "saya sudah bayar").
  // Tandai paid -> order scheduled -> buat Google Meet untuk 3 sessions.
  // Idempoten: session yang sudah punya google_event_id dilewati, jadi aman di-retry.
  finish: async (c) => {
    const user = c.get('user')
    const { id } = c.req.valid('param')

    const payment = await findPlayerPayment(id, user.id)
    if (!payment) throw new AppError('Payment tidak ditemukan', 404)
    if (payment.status === 'paid') return c.json(formatPayment(payment), 200)

    const { data: paid, error: paidError } = await supabaseAdmin
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, order_id, method, status, amount, created_at')
      .single()
    if (paidError) throw dbError(paidError)

    await supabaseAdmin
      .from('orders')
      .update({ status: 'scheduled' })
      .eq('id', payment.order_id)
      .eq('status', 'pending_payment')

    // Buat Meet link untuk sessions yang belum punya (jadwal sudah diisi saat checkout).
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('id, order_id, session_number, scheduled_at, scheduled_end, google_event_id')
      .eq('order_id', payment.order_id)
      .is('google_event_id', null)
    if (sessionsError) throw dbError(sessionsError)

    if (sessions?.length) {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('player_id, coach_id')
        .eq('id', payment.order_id)
        .single()
      if (orderError) throw dbError(orderError)

      const [{ data: player }, { data: coach }] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(order.player_id),
        supabaseAdmin.auth.admin.getUserById(order.coach_id),
      ])
      const playerEmail = player?.user?.email
      const coachEmail = coach?.user?.email
      if (!playerEmail || !coachEmail) throw new AppError('Email player atau coach tidak ditemukan', 500)

      for (const s of sessions) {
        let event
        try {
          event = await googleCalendar.events.insert({
            calendarId: 'primary',
            conferenceDataVersion: 1,
            sendUpdates: 'all',
            requestBody: {
              summary: `Coaching - Order ${s.order_id} - Session ${s.session_number}`,
              description: `Session for order ${s.order_id} with ${playerEmail} and ${coachEmail}`,
              start: { dateTime: s.scheduled_at, timeZone: 'Asia/Jakarta' },
              end: { dateTime: s.scheduled_end, timeZone: 'Asia/Jakarta' },
              attendees: [{ email: playerEmail }, { email: coachEmail }],
              conferenceData: {
                createRequest: {
                  requestId: crypto.randomUUID(),
                  conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
              },
            },
          })
        } catch (e) {
          throw new AppError(
            e?.response?.data?.error?.message ?? e?.message ?? 'Gagal membuat Meet link',
            502,
          )
        }

        const { error: updateError } = await supabaseAdmin
          .from('sessions')
          .update({ meeting_link: event.data.hangoutLink, google_event_id: event.data.id })
          .eq('id', s.id)
        if (updateError) throw dbError(updateError)
      }
    }

    return c.json(formatPayment({ ...paid, status: 'paid' }), 200)
  },
}
