import { clearSession, getAccessToken, getSession, setSession } from '../utils/session'

// Set VITE_USE_MOCK=false in frontend/.env once the backend is ready.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Multipart upload (FormData). The JSON `request` above can't send files.
export const uploadRequest = async (path, form) => {
  const token = getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data
}

let isRefreshing = false
let refreshPromise = null

const refreshAccessToken = async () => {
  const session = getSession()
  if (!session?.refresh_token) {
    clearSession()
    throw new Error('No refresh token')
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    clearSession()
    throw new Error(data.message || 'Token refresh failed')
  }

  setSession(data)
  return data.access_token
}

export const request = async (path, { method = 'GET', body } = {}) => {
  // For mock mode, use the original simple request
  if (USE_MOCK) {
    const token = getAccessToken()
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

  // Real API mode with auto-refresh
  const makeRequest = async (token) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    return { res, data }
  }

  // First attempt with current access token
  let token = getAccessToken()
  let { res, data } = await makeRequest(token)

  // If 401 and not already refreshing, try to refresh token
  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken()
        .finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
    }

    try {
      token = await refreshPromise
      // Retry original request with new token
      const retry = await makeRequest(token)
      res = retry.res
      data = retry.data
    } catch (err) {
      // Refresh failed, clear session and throw
      clearSession()
      // Redirect to login if we're in a browser context
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw err
    }
  }

  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}
