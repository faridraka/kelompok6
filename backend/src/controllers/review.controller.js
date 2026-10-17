import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

export const reviewController = {
  // POST /orders/:id/rating (player only). Player memberi rating ke coach.
  // orders.status TIDAK pernah diubah dari backend; trigger on_rating_created yang mengubahnya.
  rate: async (c) => {
    const user = c.get('user')
    const { id } = c.req.valid('param')
    const { rating, review } = c.req.valid('json')

    // 1. Order harus milik player yang login. Order orang lain = "tidak ditemukan".
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .eq('player_id', user.id)
      .maybeSingle()
    if (orderError) throw dbError(orderError)
    if (!order) throw new AppError('Order tidak ditemukan', 404)

    // 2. Order harus sudah menunggu rating DAN coach sudah memberi performance review.
    if (order.status !== 'awaiting_rating') throw new AppError('Coach belum memberi review', 400)
    const { data: performanceReview, error: reviewError } = await supabaseAdmin
      .from('performance_reviews')
      .select('order_id')
      .eq('order_id', id)
      .maybeSingle()
    if (reviewError) throw dbError(reviewError)
    if (!performanceReview) throw new AppError('Coach belum memberi review', 400)

    // 3. Insert rating; rated_at memakai default-nya. order_id adalah PK: duplikat = sudah dirating.
    const { error: insertError } = await supabaseAdmin
      .from('ratings')
      .insert({ order_id: id, rating, review: review ?? null })
      .select('rating, review, rated_at')
      .single()
    if (insertError) {
      if (insertError.code === '23505') throw new AppError('Order sudah dirating', 409)
      throw dbError(insertError)
    }

    return c.json({ ok: true }, 201)
  },

  // POST /orders/:id/performance-review (coach only). Coach menulis/ mengubah performance review.
  // orders.status TIDAK pernah diubah dari backend; DB sudah memindahkannya ke awaiting_rating
  // saat semua sesi selesai.
  savePerformanceReview: async (c) => {
    const user = c.get('user')
    const { id } = c.req.valid('param')
    const { notes, strengths, weaknesses, recommendation } = c.req.valid('json')

    // 1. Order harus milik coach yang login. Order coach lain = "tidak ditemukan".
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .eq('coach_id', user.id)
      .maybeSingle()
    if (orderError) throw dbError(orderError)
    if (!order) throw new AppError('Order tidak ditemukan', 404)

    // 2. Order yang sudah completed terkunci: player sudah memberi rating.
    if (order.status === 'completed') throw new AppError('Terkunci, player sudah memberi rating', 400)

    // 3. Semua sesi order harus sudah completed.
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('id, status')
      .eq('order_id', id)
    if (sessionsError) throw dbError(sessionsError)
    if (!sessions?.length || sessions.some((s) => s.status !== 'completed')) {
      throw new AppError('Selesaikan semua sesi dulu', 400)
    }

    // Coach boleh mengubah review sampai player memberi rating: upsert pada order_id.
    // created_at tidak dikirim (memakai default).
    const { error: upsertError } = await supabaseAdmin
      .from('performance_reviews')
      .upsert(
        { order_id: id, notes, strengths, weaknesses, recommendation: recommendation ?? null },
        { onConflict: 'order_id' },
      )
      .select('notes, strengths, weaknesses, recommendation')
      .single()
    if (upsertError) throw dbError(upsertError)

    return c.json({ ok: true }, 200)
  },
}
