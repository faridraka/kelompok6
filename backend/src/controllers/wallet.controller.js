import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

const one = (value) => (Array.isArray(value) ? value[0] : value) ?? null

// GET /wallet (coach only). No new tables: computed from coach price + orders.
// Rule (same as FE wallet.js): 1 order = 1 credit of coach price (no tax).
// 'completed' -> Available, otherwise Pending. pending_payment never shown to coach.
export const walletController = {
  get: async (c) => {
    const user = c.get('user')
    if (!user?.id) throw new AppError('Token tidak ada / tidak valid', 401)

    const { data: coach, error: coachError } = await supabaseAdmin
      .from('coach_profiles')
      .select('price')
      .eq('id', user.id)
      .maybeSingle()
    if (coachError) throw dbError(coachError)
    if (!coach) throw new AppError('Profil coach tidak ditemukan', 404)

    const unit = Number(coach.price) || 0

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, lane, status, created_at, player:profiles!orders_player_id_fkey(name)')
      .eq('coach_id', user.id)
      .neq('status', 'pending_payment')
      .order('created_at', { ascending: false })
    if (ordersError) throw dbError(ordersError)

    const transactions = (orders ?? []).map((o) => ({
      id: o.id,
      playerName: one(o.player)?.name ?? 'Player',
      lane: o.lane,
      date: o.created_at ?? null,
      amount: unit,
      status: o.status === 'completed' ? 'Available' : 'Pending',
    }))

    const available = transactions.filter((t) => t.status === 'Available').reduce((sum, t) => sum + t.amount, 0)
    const pending = transactions.filter((t) => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0)

    return c.json(
      { available, pending, totalEarned: available + pending, players: transactions.length, transactions },
      200,
    )
  },
}
