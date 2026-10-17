import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

// Gaya embed FK yang sama seperti order.controller.js (hanya baca).
const ORDERS_WITH_PLAYER = 'id, player:profiles!orders_player_id_fkey(name)'

const one = (value) => (Array.isArray(value) ? value[0] : value) ?? null

export const ratingsController = {
  // GET /ratings (coach only). Semua rating dari order milik coach yang login.
  // ratings tidak punya coach_id, jadi join lewat orders.coach_id.
  list: async (c) => {
    const user = c.get('user')
    if (!user?.id) throw new AppError('Token tidak ada / tidak valid', 401)

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(ORDERS_WITH_PLAYER)
      .eq('coach_id', user.id)
    if (ordersError) throw dbError(ordersError)
    if (!orders?.length) return c.json([], 200)

    const nicknameByOrder = new Map(
      orders.map((o) => [o.id, one(o.player)?.name ?? 'Player']),
    )

    const { data: ratings, error: ratingsError } = await supabaseAdmin
      .from('ratings')
      .select('order_id, rating, review, rated_at')
      .in('order_id', [...nicknameByOrder.keys()])
      .order('rated_at', { ascending: false })
    if (ratingsError) throw dbError(ratingsError)

    const items = (ratings ?? []).map((r) => ({
      playerNickname: nicknameByOrder.get(r.order_id) ?? 'Player',
      rating: r.rating,
      comment: r.review ?? '',
      ratedAt: r.rated_at,
      orderId: r.order_id,
    }))

    // ratedAt null selalu di belakang.
    items.sort((a, b) => {
      if (a.ratedAt == null && b.ratedAt == null) return 0
      if (a.ratedAt == null) return 1
      if (b.ratedAt == null) return -1
      return String(b.ratedAt).localeCompare(String(a.ratedAt))
    })

    return c.json(items, 200)
  },
}
