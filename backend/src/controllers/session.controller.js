import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const toSession = (row, totalSessions, coach) => ({
  id: row.id,
  orderId: row.order_id,
  sessionNumber: row.session_number,
  totalSessions,
  scheduledAt: row.scheduled_at,
  scheduledEnd: row.scheduled_end,
  meetingLink: row.meeting_link,
  status: row.status,
  vod: row.vod_url ? { url: row.vod_url, downloadUrl: row.vod_download_url ?? row.vod_url } : null,
  completedAt: row.completed_at,
  ...(coach ? { coach } : {}),
})

export const sessionController = {
  list: async (c) => {
    const user = c.get('user')
    if (!user?.id) throw new AppError('Unauthorized', 401)

    let role = user.role
    if (!role) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle()
      role = profile?.role
    }
    if (role !== 'player' && role !== 'coach') throw new AppError('Forbidden', 403)

    const { orderId } = c.req.valid('query')
    const ownerColumn = role === 'player' ? 'player_id' : 'coach_id'

    // 1. Orders milik user (sumber totalSessions + kepemilikan).
    let ordersQuery = supabaseAdmin
      .from('orders')
      .select('id, session_count, coach_id')
      .eq(ownerColumn, user.id)
    if (orderId) ordersQuery = ordersQuery.eq('id', orderId)
    const { data: orders, error: ordersError } = await ordersQuery
    if (ordersError) throw new AppError(ordersError.message, 500)
    if (orderId && (!orders || orders.length === 0)) throw new AppError('Order tidak ditemukan', 404)
    if (!orders || orders.length === 0) return c.json([], 200)

    const byOrderId = new Map(orders.map((o) => [o.id, o]))

    // 2. Sessions via FK sessions.order_id -> orders.id.
    const { data: rows, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('id, order_id, session_number, scheduled_at, scheduled_end, status, meeting_link, vod_url, vod_download_url, completed_at')
      .in('order_id', [...byOrderId.keys()])
      .order('session_number', { ascending: true })
    if (sessionsError) throw new AppError(sessionsError.message, 500)

    // 3. Info coach untuk sisi player (s.coach.name dipakai PlayerDashboard/Sessions/Vods).
    let coaches = new Map()
    if (role === 'player') {
      const coachIds = [...new Set(orders.map((o) => o.coach_id).filter(Boolean))]
      if (coachIds.length) {
        const [{ data: profiles }, { data: coachProfiles }] = await Promise.all([
          supabaseAdmin.from('profiles').select('id, name').in('id', coachIds),
          supabaseAdmin.from('coach_profiles').select('id, avatar_url').in('id', coachIds),
        ])
        const avatars = new Map((coachProfiles ?? []).map((cp) => [cp.id, cp.avatar_url]))
        coaches = new Map((profiles ?? []).map((p) => [p.id, { id: p.id, name: p.name, avatar: avatars.get(p.id) ?? null }]))
      }
    }

    const data = (rows ?? []).map((row) => {
      const order = byOrderId.get(row.order_id)
      const coach = role === 'player' ? (coaches.get(order?.coach_id) ?? { id: order?.coach_id, name: 'Coach', avatar: null }) : undefined
      return toSession(row, order?.session_count ?? 3, coach)
    })
    return c.json(data, 200)
  },
}
