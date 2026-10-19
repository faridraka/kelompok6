import { useEffect } from 'react'
import { getCoachAvailability, getCoachProfile, getCoachRatings, getCoachWallet } from '../../api/coach'
import AvailabilityForm from '../../components/coach/AvailabilityForm'
import ProfileForm from '../../components/coach/ProfileForm'
import ProfileSummary from '../../components/coach/ProfileSummary'
import WalletCard from '../../components/coach/WalletCard'
import { ratingStats } from '../../components/coach/stats'
import { Async } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'

const load = async () => {
  const [coach, ratings, availability, wallet] = await Promise.all([
    getCoachProfile(),
    getCoachRatings(),
    getCoachAvailability(),
    getCoachWallet().catch(() => null), // the wallet is optional: the page must render without it
  ])
  return { coach, stats: ratingStats(ratings), availability, wallet } // the rating is read-only and comes from the same list as the dashboard
}

const CoachProfile = () => {
  const state = useAsync(load)
  // Deep link from the nav dropdown (/coach/profile#wallet) scrolls to the wallet section once it renders.
  useEffect(() => {
    if (state.data && window.location.hash === '#wallet') document.getElementById('wallet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [state.data])
  return (
    <>
      {/* Keep the page on screen while it reloads after a save. */}
      <Async state={{ ...state, loading: state.loading && !state.data }}>
        {({ coach, stats, availability, wallet }) => (
          <div className="space-y-4">
            <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.8fr]">
              <ProfileSummary coach={coach} stats={stats} availability={availability} />
              <ProfileForm coach={coach} onSaved={state.reload} />
            </div>
            <WalletCard wallet={wallet} />
            <AvailabilityForm availability={availability} onSaved={state.reload} />
          </div>
        )}
      </Async>
    </>
  )
}
export default CoachProfile
