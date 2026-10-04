import { useEffect } from 'react'
import { getCoachProfile } from '../api/coach'
import { useAsync } from './useAsync'

// The coach profile for parts of the layout that stay mounted (the nav chip). The Profile page calls profileChanged() after a save,
// and every place using this hook loads the profile again, so the new name shows up without a reload.
const EVENT = 'coach-profile-changed'
export const profileChanged = () => window.dispatchEvent(new Event(EVENT))

export const useCoachProfile = () => {
  const state = useAsync(getCoachProfile)
  const { reload } = state
  useEffect(() => {
    window.addEventListener(EVENT, reload)
    return () => window.removeEventListener(EVENT, reload)
  }, [reload])
  return state
}
