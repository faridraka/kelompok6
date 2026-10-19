// Coach API — real backend only (mock removed for coach dashboard).
// Shapes follow the OpenAPI docs; pages keep reading the same camelCase fields.
import { request, uploadRequest } from './client'

export const getCoachProfile = () => request('/users/me') // USER-1
export const getCoachOrders = () => request('/orders') // ORD-2 (coach view)
export const getCoachSessions = () => request('/sessions') // SESS-1
export const getCoachRatings = () => request('/ratings') // GET /ratings
export const saveCoachProfile = (body) => request('/users/me', { method: 'PUT', body }) // body: { name, peakRank, mainHero, price, bio, lanes[], avatar? }
export const getCoachAvailability = () => request('/users/me/availability') // AVAIL-1
export const saveCoachAvailability = (body) => request('/users/me/availability', { method: 'PUT', body }) // AVAIL-2
// AVA-1  POST /uploads/avatar (multipart file) -> { url }
export const uploadCoachAvatar = (file) => {
  const form = new FormData()
  form.append('file', file)
  return uploadRequest('/uploads/avatar', form)
}
export const completeCoachSession = (id) => request(`/sessions/${id}/complete`, { method: 'PATCH' }) // SESS-5
export const saveCoachReview = (id, body) => request(`/orders/${id}/performance-review`, { method: 'POST', body }) // REV-5
export const saveCoachRecording = (id, body) => request(`/sessions/${id}/recording`, { method: 'POST', body }) // SESS-6. body: { url }
// VOD-1  POST /uploads/vod (multipart file) -> { url }
export const uploadCoachVod = (file) => {
  const form = new FormData()
  form.append('file', file)
  return uploadRequest('/uploads/vod', form)
}
// ===== WALLET =====

// Coerces one payload value to a finite Number (0 for missing or invalid input).
const toNumber = (value) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN
  return Number.isFinite(n) ? n : 0
}

// Shapes one transaction for WalletCard, keeping every field in its declared type.
const normalizeTransaction = (raw, index) => ({
  id: raw?.id ?? `wallet-tx-${index}`,
  playerName: typeof raw?.playerName === 'string' && raw.playerName.trim() ? raw.playerName : 'Player',
  lane: typeof raw?.lane === 'string' && raw.lane ? raw.lane : null,
  date: typeof raw?.date === 'string' && raw.date ? raw.date : null,
  amount: toNumber(raw?.amount),
  status: raw?.status === 'Available' ? 'Available' : 'Pending', // unknown money is never shown as Available
})

// Normalizes any /wallet payload so a missing or malformed one becomes zeros and [].
export const normalizeWallet = (raw) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const list = Array.isArray(source.transactions) ? source.transactions.filter((t) => t && typeof t === 'object') : []
  return {
    available: toNumber(source.available),
    pending: toNumber(source.pending),
    totalEarned: toNumber(source.totalEarned),
    players: toNumber(source.players),
    transactions: list.map(normalizeTransaction),
  }
}

// GET /wallet — always resolves to a normalized wallet; failures are handled by the caller.
export const getCoachWallet = () => request('/wallet').then(normalizeWallet)

// GET /materials — coach token returns only the coach's own rows (newest first).
export const getCoachMaterials = () => request('/materials')
export const createCoachMaterial = (body) => request('/materials', { method: 'POST', body }) // body: { type, title, tagline?, description?, thumbnailUrl?, link }
// MAT-1  POST /uploads/materials (multipart file, pdf/image/video, 50MB) -> { url }
export const uploadCoachMaterial = (file) => {
  const form = new FormData()
  form.append('file', file)
  return uploadRequest('/uploads/materials', form)
}
