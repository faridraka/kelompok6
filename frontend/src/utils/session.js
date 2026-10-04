// Session management - handles auth tokens and user data from backend
// Tokens stored in localStorage, refreshed automatically via API client

const SESSION_KEY = 'metagames_session'
const USER_KEY = 'metagames_user'

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export const getAccessToken = () => {
  const session = getSession()
  if (!session?.access_token) return null

  // Check if token is expired (with 30s buffer)
  if (session.expires_at && Date.now() / 1000 >= session.expires_at - 30) {
    return null // Signal that token needs refresh
  }

  return session.access_token
}

export const setSession = (data) => {
  const { access_token, refresh_token, expires_at, user } = data
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    access_token,
    refresh_token,
    expires_at,
  }))
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isAuthenticated = () => {
  const session = getSession()
  return !!(session?.access_token && session?.refresh_token)
}

export const getUserRole = () => {
  const user = getStoredUser()
  return user?.role || null
}
