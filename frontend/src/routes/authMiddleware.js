import { redirect } from 'react-router'
import { isAuthenticated, getUserRole } from '../utils/session'

// Loader for routes that require authentication
export const protectedLoader = () => {
  if (!isAuthenticated()) {
    throw redirect('/login')
  }
  return null
}

// Loader for guest-only routes (login, register)
export const guestLoader = () => {
  if (isAuthenticated()) {
    const role = getUserRole()
    throw redirect(role === 'coach' ? '/coach/dashboard' : '/player/dashboard')
  }
  return null
}

// Loader for coach-only routes
export const coachOnlyLoader = () => {
  if (!isAuthenticated()) {
    throw redirect('/login')
  }
  if (getUserRole() !== 'coach') {
    throw redirect('/player/dashboard')
  }
  return null
}

// Loader for player-only routes (optional, if you want strict separation)
export const playerOnlyLoader = () => {
  if (!isAuthenticated()) {
    throw redirect('/login')
  }
  if (getUserRole() !== 'player') {
    throw redirect('/coach/dashboard')
  }
  return null
}