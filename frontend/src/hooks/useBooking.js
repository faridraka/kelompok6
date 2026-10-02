import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { getCoach } from '../api/coaches'
import { getSession } from '../utils/session'

//These are shared by cart and checkout, also forces player to choose one lane only yay
export const useBooking = () => {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const session = getSession()
  const coachId = params.get('coach')
  const laneParam = params.get('lane')
  const [state, setState] = useState({ status: 'loading', coach: null })

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true, state: { from: location.pathname + location.search } })
      return
    }
    getCoach(coachId)
      .then((coach) => setState(coach ? { status: 'ready', coach } : { status: 'invalid', coach: null }))
      .catch(() => setState({ status: 'invalid', coach: null }))
  }, [coachId])

  const { coach } = state
  const lane = !coach ? null : coach.lanes.length === 1 ? coach.lanes[0] : coach.lanes.includes(laneParam) ? laneParam : null
  const setLane = (l) => setParams({ coach: coachId, lane: l }, { replace: true })

  return { status: state.status, coach, lane, setLane, coachId, session }
}
