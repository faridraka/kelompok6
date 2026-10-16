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
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('ratings')
      .insert({ order_id: id, rating, review: review ?? null })
      .select('rating, review, rated_at')
      .single()
    if (insertError) {
      if (insertError.code === '23505') throw new AppError('Order sudah dirating', 409)
      throw dbError(insertError)
    }

    return c.json({ rating: inserted.rating, review: inserted.review, ratedAt: inserted.rated_at }, 201)
  },
}
