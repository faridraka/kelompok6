import { getSession } from '../utils/session'

// Set VITE_USE_MOCK=false in frontend/.env once the backend is ready.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const request = async (path, { method = 'GET', body } = {}) => {
  const token = getSession()?.token
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}
