import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

const one = (value) => (Array.isArray(value) ? value[0] : value) ?? null

export const ratingsController = {
  // GET /ratings (coach only). Satu query: ratings join orders (coach) -> profiles (player).
  // Urutan dari Postgres: rated_at DESC, NULL paling belakang.
  list: async (c) => {
    const user = c.get('user')
    if (!user?.id) throw new AppError('Token tidak ada / tidak valid', 401)

    const { data: ratings, error: ratingsError } = await supabaseAdmin
      .from('ratings')
      .select('order_id, rating, review, rated_at, orders!inner(coach_id, player:profiles!orders_player_id_fkey(name))')
      .eq('orders.coach_id', user.id)
      .order('rated_at', { ascending: false, nullsFirst: false })
    if (ratingsError) throw dbError(ratingsError)

    const items = (ratings ?? []).map((r) => ({
      playerNickname: one(one(r.orders)?.player)?.name ?? 'Player',
      rating: r.rating,
      comment: r.review ?? '',
      ratedAt: r.rated_at,
      orderId: r.order_id,
    }))

    return c.json(items, 200)
  },
}
