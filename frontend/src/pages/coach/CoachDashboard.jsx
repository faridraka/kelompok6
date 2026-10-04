import { getCoachOrders, getCoachProfile, getCoachRatings, getCoachSessions } from '../../api/coach'
import CoachHero from '../../components/coach/CoachHero'
import LaneBars from '../../components/coach/LaneBars'
import NextSession from '../../components/coach/NextSession'
import PlayerPipeline from '../../components/coach/PlayerPipeline'
import RatingTrend from '../../components/coach/RatingTrend'
import ReputationPanel from '../../components/coach/ReputationPanel'
import WeeklyBars from '../../components/coach/WeeklyBars'
import { laneCounts, monthlyRatings, plural, ratingStats, stageOf, weeklyCompleted } from '../../components/coach/stats'
import { Async } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'

const load = async () => {
  const [coach, orders, sessions, ratings] = await Promise.all([getCoachProfile(), getCoachOrders(), getCoachSessions(), getCoachRatings()])
  return { coach, orders, sessions, ratings }
}

const CoachDashboard = () => {
  const state = useAsync(load)
  return (
    <Async state={state}>
      {({ coach, orders, sessions, ratings }) => {
        const sessionsOf = (id) => sessions.filter((s) => s.orderId === id)
        const due = orders.filter((o) => stageOf(o, sessionsOf(o.id)) === 'due').length
        const upcoming = sessions.filter((s) => s.status === 'scheduled').sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        const next = upcoming[0]
        const stats = ratingStats(ratings) // one source for the hero and the Reputation panel

        // Hero status sentence, e.g. "2 links missing · 1 review due".
        const parts = [
          [upcoming.filter((s) => !s.meetingLink).length, 'link', 'missing'],
          [sessions.filter((s) => s.status === 'completed' && !s.vod).length, 'recording', 'missing'],
          [due, 'review', 'due'],
        ].filter(([n]) => n > 0).map(([n, word, tail]) => `${plural(n, word)} ${tail}`)

        return (
          <>
            <CoachHero coach={coach} avg={stats.avg} issues={parts.length > 0} status={parts.length ? parts.join(' · ') : "You're all caught up"} />
            <NextSession next={next} order={next && orders.find((o) => o.id === next.orderId)} />

            <section className="mt-12">
              <h2 className="mb-3 font-display text-xl font-bold uppercase text-white">Player pipeline</h2>
              <PlayerPipeline orders={orders} sessions={sessions} />
            </section>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <ReputationPanel stats={stats} />
              <RatingTrend months={monthlyRatings(ratings)} />
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <LaneBars lanes={laneCounts(orders, coach.lanes)} />
              <WeeklyBars weeks={weeklyCompleted(sessions)} />
            </div>
          </>
        )
      }}
    </Async>
  )
}
export default CoachDashboard
