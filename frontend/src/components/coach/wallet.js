// Coach wallet math (frontend only, mock mode).
// Each order = 1 registered player = a credit of the coach's price (no tax).
// 'completed' (player rated) -> Available, otherwise Pending (held until the player rates).
export const PLATFORM_FEE_RATE = 0

export const buildWallet = (orders, price) => {
  const unit = Number(price) || 0
  const net = Math.round(unit * (1 - PLATFORM_FEE_RATE))
  const transactions = (orders ?? [])
    .map((o) => ({
      id: o.id,
      playerName: o.player?.name ?? 'Player',
      lane: o.lane,
      date: o.createdAt ?? o.rating?.ratedAt ?? null,
      amount: net,
      status: o.status === 'completed' ? 'Available' : 'Pending',
    }))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  const available = transactions.filter((t) => t.status === 'Available').reduce((sum, t) => sum + t.amount, 0)
  const pending = transactions.filter((t) => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0)
  return { available, pending, totalEarned: available + pending, players: (orders ?? []).length, transactions }
}
