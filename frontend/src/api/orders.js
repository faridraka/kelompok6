/**
 * Orders & payment service. Pages ONLY import from this file.
 * Each function maps 1:1 to an endpoint in the API design (section 4).
 *
 * Shapes the UI expects (camelCase JSON, resource returned directly, no envelope):
 *
 * Order   { id, status, coach:{id,name,avatar}, lane, packageType, sessionCount,
 *           subtotal, tax, discount, totalPrice, currency:'IDR', createdAt,
 *           sessions: Session[] }
 * Session { id, sessionNumber, totalSessions, scheduledAt (ISO), status, meetingLink|null }
 * Payment { id, orderId, method:'qris', status:'pending'|'paid', amount, qrPayload, expiresAt }
 *
 * If the backend differs, adapt HERE (map the response) and the pages stay untouched.
 */
import { request, USE_MOCK } from './client'
import * as mock from './mock/ordersMock'

// ORD-1  POST /orders  -> creates order + auto-schedules the 3 sessions
// payload: { coachId, lane, billing: { firstName, lastName, email, zip, state, country } }
export const createOrder = (payload) =>
  USE_MOCK ? mock.createOrder(payload) : request('/orders', { method: 'POST', body: payload })

// ORD-3  GET /orders/:id
export const getOrder = (id) => (USE_MOCK ? mock.getOrder(id) : request(`/orders/${id}`))

// PAY-1  POST /orders/:id/payment  -> fake QRIS payment
export const createPayment = (orderId) =>
  USE_MOCK ? mock.createPayment(orderId) : request(`/orders/${orderId}/payment`, { method: 'POST' })

// PAY-2  GET /payments/:id  (polled on the QRIS screen)
export const getPayment = (id) => (USE_MOCK ? mock.getPayment(id) : request(`/payments/${id}`))

// PAY-3  POST /payments/:id/finish  -> payment paid, order confirmed (fake; Midtrans webhook later)
export const finishPayment = (id) =>
  USE_MOCK ? mock.finishPayment(id) : request(`/payments/${id}/finish`, { method: 'POST' })
