// Coach API — real backend only (mock removed for coach dashboard).
// Shapes follow the OpenAPI docs; pages keep reading the same camelCase fields.
import { request, uploadRequest } from './client'

export const getCoachProfile = () => request('/users/me') // USER-1
export const getCoachOrders = () => request('/orders') // ORD-2 (coach view)
export const getCoachSessions = () => request('/sessions') // SESS-1
export const getCoachRatings = () => request('/ratings') // GET /ratings
export const getCoachWallet = () => request('/wallet') // GET /wallet
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
// Jadwalkan sesi yang masih null (order baru dari BE): POST /sessions/:id/schedule.
// Ubah jadwal yang sudah ada: PUT /sessions/:id. Body: { scheduledAt, scheduledEnd } ISO +07:00.
export const scheduleCoachSession = (id, body) => request(`/sessions/${id}/schedule`, { method: 'POST', body })
export const rescheduleCoachSession = (id, body) => request(`/sessions/${id}`, { method: 'PUT', body })
// VOD-1  POST /uploads/vod (multipart file) -> { url }
export const uploadCoachVod = (file) => {
  const form = new FormData()
  form.append('file', file)
  return uploadRequest('/uploads/vod', form)
}
