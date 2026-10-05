// One function per endpoint, same pattern as api/player.js. Going live = editing this file only.
import { USE_MOCK, request } from './client'
import { mock } from './mock/coachMock'

export const getCoachProfile = () => (USE_MOCK ? mock.getProfile() : request('/users/me'))   // USER-1
export const getCoachOrders = () => (USE_MOCK ? mock.getOrders() : request('/orders'))       // ORD-2
export const getCoachSessions = () => (USE_MOCK ? mock.getSessions() : request('/sessions')) // SESS-1
export const getCoachWallet = () => (USE_MOCK ? mock.getWallet() : request('/wallet'))       // WAL-1
export const getCoachRatings = () => (USE_MOCK ? mock.getRatings() : request('/ratings'))     // all ratings: [{ playerNickname, rating, comment, ratedAt }] newest first. TODO: confirm the endpoint in the API design
export const saveCoachProfile = (body) => (USE_MOCK ? mock.saveProfile(body) : request('/users/me', { method: 'PUT', body })) // body: { name, academyLabel, peakRank, mainHero, price, bio, lanes[] }. TODO: confirm the endpoint in the API design
export const updateCoachSession = (id, body) => (USE_MOCK ? mock.updateSession(id, body) : request(`/sessions/${id}`, { method: 'PUT', body })) // SESS-4
export const createCoachSchedule = (id, body) => (USE_MOCK ? mock.createSchedule(id, body) : request(`/sessions/${id}/schedule`, { method: 'POST', body })) // SESS-3 (stub: backend creates the Google Calendar event + Meet link; not implemented yet). body: { scheduledAt, scheduledEnd }
export const completeCoachSession = (id) => (USE_MOCK ? mock.completeSession(id) : request(`/sessions/${id}/complete`, { method: 'PATCH' })) // SESS-5
export const saveCoachReview = (id, body) => (USE_MOCK ? mock.saveReview(id, body) : request(`/orders/${id}/performance-review`, { method: 'POST', body })) // REV-5
export const saveCoachRecording = (id, body) => (USE_MOCK ? mock.saveRecording(id, body) : request(`/sessions/${id}/recording`, { method: 'POST', body })) // SESS-6. body: { url, material } where material = { type, title, tagline, description, thumbnailUrl, link } | null (remove)
