import CoachLayout from './CoachLayout'
import SummaryCard from './dashboard/SummaryCard'
import UpcomingSession from './dashboard/UpcomingSession'
import ActiveCoaching from './dashboard/ActiveCoaching'
import PendingTasks from './dashboard/PendingTasks'
import BalancePanel from './dashboard/BalancePanel'

import {
  coachProfile,
  coachSummary,
  upcomingSessions,
  activeCoachingList,
  pendingTasks,
  coachWallet,
} from '../../data/coachDummyData'

const formatBalanceShort = (amount) => {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}M`
  }

  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}K`
  }

  return `Rp ${amount}`
}

const SectionHeading = ({ eyebrow, title }) => (
  <div className="mb-4">
    <p className="mb-1 font-display text-[11px] font-semibold uppercase tracking-[0.26em] text-periwinkle-300">
      {eyebrow}
    </p>
    <h2 className="font-display text-xl font-bold uppercase text-white">
      {title}
    </h2>
  </div>
)

const CoachDashboard = () => {
  return (
    <CoachLayout>
      <section className="relative mt-6 min-h-[390px] overflow-hidden">
        <img
          src="/src/assets/coach/xepherdraft.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_10%] opacity-[0.42]"
        />

        <div className="absolute inset-0 bg-navy-950/45" />

        <div className="absolute inset-y-0 left-0 w-[65%] bg-gradient-to-r from-navy-950 via-navy-950/95 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />

        <div className="relative z-10 flex min-h-[390px] items-center px-7 lg:px-10">
          <div className="max-w-[620px]">
            <p className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-periwinkle-300">
              Coach Dashboard
            </p>

            <h1 className="font-display text-4xl font-bold uppercase leading-none text-white lg:text-5xl">
              Welcome back,
              <br />
              <span className="text-cyan-glow">
                {coachProfile.name}
              </span>
            </h1>

            <p className="mt-4 text-sm text-white/55">
              {coachProfile.game} · {coachProfile.role} · {coachProfile.rank}
            </p>

            <p className="mt-6 max-w-md text-sm leading-6 text-white/60">
              You have{' '}
              <span className="font-semibold text-white">
                {coachSummary.upcomingSessions} upcoming session
                {coachSummary.upcomingSessions !== 1 ? 's' : ''}
              </span>{' '}
              and{' '}
              <span className="font-semibold text-gold-400">
                {coachSummary.pendingReviews} pending review
                {coachSummary.pendingReviews !== 1 ? 's' : ''}
              </span>{' '}
              to complete.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          <SummaryCard
            label="Active Coaching"
            value={coachSummary.activeCoaching}
            accent="cyan"
          />
          <SummaryCard
            label="Upcoming Sessions"
            value={coachSummary.upcomingSessions}
            accent="default"
          />
          <SummaryCard
            label="Pending Reviews"
            value={coachSummary.pendingReviews}
            accent="red"
          />
          <SummaryCard
            label="Available Balance"
            value={formatBalanceShort(coachSummary.availableBalance)}
            accent="gold"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10 py-10 xl:grid-cols-3">
        <div className="flex flex-col gap-10 xl:col-span-2">
          <section>
            <SectionHeading
              eyebrow="Schedule"
              title="Upcoming Sessions"
            />
            <UpcomingSession sessions={upcomingSessions} />
          </section>

          <section>
            <SectionHeading
              eyebrow="Coaching"
              title="Active Coaching"
            />
            <ActiveCoaching coachingList={activeCoachingList} />
          </section>
        </div>

        <div className="flex flex-col gap-10">
          <section>
            <SectionHeading
              eyebrow="Action Required"
              title="Pending Tasks"
            />
            <PendingTasks tasks={pendingTasks} />
          </section>

          <section>
            <SectionHeading
              eyebrow="Wallet"
              title="Balance"
            />
            <BalancePanel wallet={coachWallet} />
          </section>
        </div>
      </div>
    </CoachLayout>
  )
}

export default CoachDashboard