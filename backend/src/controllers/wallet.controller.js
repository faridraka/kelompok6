import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

// ===== 1. KONFIGURASI =====

const PLATFORM_FEE_RATE = 0 // Bagian platform per transaksi; 0 = coach menerima penuh.
const EXCLUDED_STATUS = 'pending_payment' // Order yang belum dibayar tidak pernah ditampilkan ke coach.
const COMPLETED_STATUS = 'completed' // Status order yang sudah selesai (player sudah menilai).
const STATUS_AVAILABLE = 'Available' // Label status transaksi yang sudah bisa dicairkan.
const STATUS_PENDING = 'Pending' // Label status transaksi yang masih ditahan.

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

// ===== 2. QUERY =====

// Mengambil order milik coach (tanpa pending_payment), terbaru dulu, beserta nama player.
const fetchCoachOrders = async (coachId) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, lane, status, subtotal, created_at, player:profiles!orders_player_id_fkey(name)')
    .eq('coach_id', coachId)
    .neq('status', EXCLUDED_STATUS)
    .order('created_at', { ascending: false })
  if (error) throw dbError(error)
  return data ?? []
}

// ===== 3. MAPPING =====

// Embed to-one (profiles) bisa berupa objek atau array: ambil elemen pertamanya.
const one = (value) => (Array.isArray(value) ? value[0] : value) ?? null

// Satu order = satu player terdaftar = satu transaksi, amount = subtotal tanpa pajak.
const toTransaction = (order) => ({
  id: order.id,
  playerName: one(order.player)?.name ?? 'Player',
  lane: order.lane,
  date: order.created_at ?? null,
  amount: Math.round(Number(order.subtotal) * (1 - PLATFORM_FEE_RATE)),
  status: order.status === COMPLETED_STATUS ? STATUS_AVAILABLE : STATUS_PENDING,
})

// ===== 4. PERHITUNGAN =====

// Menjumlahkan amount semua transaksi dengan status tertentu.
const sumAmount = (transactions, status) =>
  transactions.filter((t) => t.status === status).reduce((sum, t) => sum + t.amount, 0)

// Mengubah daftar order menjadi ringkasan dompet coach.
const buildWallet = (orders) => {
  const transactions = orders.map(toTransaction)
  const available = sumAmount(transactions, STATUS_AVAILABLE)
  const pending = sumAmount(transactions, STATUS_PENDING)
  return { available, pending, totalEarned: available + pending, players: transactions.length, transactions }
}

// ===== 5. HANDLER =====

export const walletController = {
  // GET /wallet (coach only): dompet coach dari order miliknya, tanpa order pending_payment.
  get: async (c) => {
    const user = c.get('user')
    if (!user?.id) throw new AppError('Token tidak ada / tidak valid', 401)

    const orders = await fetchCoachOrders(user.id)
    return c.json(buildWallet(orders), 200)
  },
}
