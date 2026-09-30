// Reads the current login. Today: localStorage (see LoginPage).
// NEXT WEEK: replace with GET /auth/me (AUTH-3) and keep the same return shape.
export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem('metagames_session')) || null
  } catch {
    return null
  }
}

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('metagames_user')) || null
  } catch {
    return null
  }
}
