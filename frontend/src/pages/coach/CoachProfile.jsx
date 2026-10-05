import { getCoachProfile, getCoachRatings } from '../../api/coach'
import ProfileForm from '../../components/coach/ProfileForm'
import ProfileSummary from '../../components/coach/ProfileSummary'
import { ratingStats } from '../../components/coach/stats'
import { Async } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'

const load = async () => {
  const [coach, ratings] = await Promise.all([getCoachProfile(), getCoachRatings()])
  return { coach, stats: ratingStats(ratings) } // the rating is read-only and comes from the same list as the dashboard
}

const CoachProfile = () => {
  const state = useAsync(load)
  return (
    <>
      {/* Keep the page on screen while it reloads after a save. */}
      <Async state={{ ...state, loading: state.loading && !state.data }}>
        {({ coach, stats }) => (
          <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.8fr]">
            <ProfileSummary coach={coach} stats={stats} />
            <ProfileForm coach={coach} onSaved={state.reload} />
          </div>
        )}
      </Async>
    </>
  )
}
export default CoachProfile
