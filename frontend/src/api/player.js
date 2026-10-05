// One function per endpoint. Components only import from here, so going live = editing this file.
import { USE_MOCK, request } from './client'
import { mock } from './mock/playerMock'

export const getSessions = () => (USE_MOCK ? mock.getSessions() : request('/sessions'))                 // SESS-1
export const getOrders = () => (USE_MOCK ? mock.getOrders() : request('/orders'))                       // ORD-2
export const getOrder = (id) => (USE_MOCK ? mock.getOrder(id) : request(`/orders/${id}`))               // ORD-3
export const getMe = () => (USE_MOCK ? mock.getMe() : request('/users/me'))                             // USER-1
export const getConfig = () => (USE_MOCK ? mock.getConfig() : request('/config'))                       // SYS-1
export const postRating = (id, body) => (USE_MOCK ? mock.postRating(id, body) : request(`/orders/${id}/rating`, { method: 'POST', body })) // REV-3
export const completeSession = (id) => (USE_MOCK ? mock.completeSession(id) : request(`/sessions/${id}/complete`, { method: 'PATCH' })) // SESS-5 (player)
// NOT in the API doc yet: needs endpoints (materials, VOD fields on sessions, change password).
export const getMaterials = () => (USE_MOCK ? mock.getMaterials() : request('/materials'))
export const changePassword = (body) => (USE_MOCK ? mock.changePassword() : request('/auth/change-password', { method: 'POST', body }))
