import { getCoachAvailability, getCoachProfile, getCoachRatings } from '../../api/coach'
import AvailabilityForm from '../../components/coach/AvailabilityForm'
import ProfileForm from '../../components/coach/ProfileForm'
import ProfileSummary from '../../components/coach/ProfileSummary'
import { ratingStats } from '../../components/coach/stats'
import { Async } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'

const load = async () => {
  const [coach, ratings, availability] = await Promise.all([getCoachProfile(), getCoachRatings(), getCoachAvailability()])
  return { coach, stats: ratingStats(ratings), availability } // the rating is read-only and comes from the same list as the dashboard
}

const CoachProfile = () => {
  const state = useAsync(load)
  return (
    <>
      {/* Keep the page on screen while it reloads after a save. */}
      <Async state={{ ...state, loading: state.loading && !state.data }}>
        {({ coach, stats, availability }) => (
          <div className="space-y-4">
            <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.8fr]">
              <ProfileSummary coach={coach} stats={stats} availability={availability} />
              <ProfileForm coach={coach} onSaved={state.reload} />
            </div>
            <AvailabilityForm availability={availability} onSaved={state.reload} />
          </div>
        )}
      </Async>
    </>
  )
}
export default CoachProfile
