// MOCK BACKEND (localStorage). DELETE this folder when the real API is live.
import { generateCoaches } from '../../data/coaches'
import { calcTotals } from '../../utils/pricing'

const KEY = 'metagames_mock_db'
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms))
const load = () => JSON.parse(localStorage.getItem(KEY) || '{"orders":{},"payments":{}}')
const save = (db) => localStorage.setItem(KEY, JSON.stringify(db))
const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}`

const autoSchedule = () =>
  [0, 1, 2].map((i) => {
    const d = new Date()
    d.setDate(d.getDate() + 3 + i * 7)
    d.setHours(19, 0, 0, 0)
    return { id: uid('ses'), sessionNumber: i + 1, totalSessions: 3, scheduledAt: d.toISOString(), status: 'scheduled', meetingLink: null }
  })

export const createOrder = async ({ coachId, lane }) => {
  await wait()
  const coach = generateCoaches(9).find((c) => String(c.id) === String(coachId))
  if (!coach) throw new Error('Coach not found')
  const t = calcTotals(coach.price)
  const order = {
    id: uid('ord'), status: 'pending_payment',
    coach: { id: coach.id, name: coach.name, avatar: null, discordUsername: coach.discordUsername },
    lane, packageType: '3_session', sessionCount: 3,
    subtotal: t.subtotal, tax: t.tax, discount: t.discount, totalPrice: t.total, currency: 'IDR',
    createdAt: new Date().toISOString(), sessions: autoSchedule(),
  }
  const db = load(); db.orders[order.id] = order; save(db)
  return order
}

export const getOrder = async (id) => {
  await wait(200)
  const o = load().orders[id]
  if (!o) throw new Error('Order not found')
  return o
}

export const createPayment = async (orderId) => {
  await wait()
  const db = load()
  const order = db.orders[orderId]
  if (!order) throw new Error('Order not found')
  const payment = {
    id: uid('pay'), orderId, method: 'qris', status: 'pending',
    amount: order.totalPrice, qrPayload: 'PLACEHOLDER', expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
  }
  db.payments[payment.id] = payment; save(db)
  return payment
}

export const getPayment = async (id) => {
  const p = load().payments[id]
  if (!p) throw new Error('Payment not found')
  return p
}

export const finishPayment = async (id) => {
  await wait()
  const db = load()
  const p = db.payments[id]
  if (!p) throw new Error('Payment not found')
  p.status = 'paid'
  db.orders[p.orderId].status = 'scheduled'
  save(db)
  return p
}

// Used by the player dashboard mock so orders created at checkout show up there.
export const listOrders = () => Object.values(load().orders)
