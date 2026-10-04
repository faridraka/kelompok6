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

// DUMMY: there is no coach id in the login data yet. The email decides who the coach is
// ("faros" -> 1, "seemon" -> 2, anything else -> 1). NEXT: replace with GET /auth/me (AUTH-3)
// and return the logged-in user's id. This is the ONLY place that knows about coach ids.
export const getCoachId = () => {
  const email = (getSession()?.email ?? '').toLowerCase()
  if (email.includes('seemon')) return 2
  return 1
}
