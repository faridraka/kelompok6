// CoachDashboard
// Halaman utama Coach Perspective.
// Semua data diambil dari coachDummyData.js — ganti dengan API call nanti.

import CoachLayout from '../../components/coach/CoachLayout'
import SummaryCard from '../../components/coach/dashboard/SummaryCard'
import UpcomingSession from '../../components/coach/dashboard/UpcomingSession'
import ActiveCoaching from '../../components/coach/dashboard/ActiveCoaching'
import PendingTasks from '../../components/coach/dashboard/PendingTasks'
import BalancePanel from '../../components/coach/dashboard/BalancePanel'

import {
  coachProfile,
  coachSummary,
  upcomingSessions,
  activeCoachingList,
  pendingTasks,
  coachWallet,
} from '../../../data/coachDummyData'

// Format Rupiah ringkas: 450000 → "Rp 450K"
const formatBalanceShort = (amount) => {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}K`
  return `Rp ${amount}`
}

// Section heading — eyebrow label + judul, persis pola Landing Page
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
      {/* ── WELCOME SECTION ── */}
      <section className="mb-10">
        <p className="mb-1 font-display text-[11px] font-semibold uppercase tracking-[0.26em] text-periwinkle-300">
          Coach Panel
        </p>
        <h1 className="font-display text-3xl font-bold uppercase text-white lg:text-4xl">
          Welcome back,{' '}
          <span className="text-cyan-glow">{coachProfile.name}</span>
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {coachProfile.game} · {coachProfile.role} · {coachProfile.rank}
        </p>

        {/* Pesan aktivitas singkat */}
        <p className="mt-4 max-w-xl text-sm text-white/60">
          You have{' '}
          <span className="font-semibold text-white">{coachSummary.upcomingSessions} upcoming session{coachSummary.upcomingSessions !== 1 ? 's' : ''}</span>{' '}
          and{' '}
          <span className="font-semibold text-gold-400">{coachSummary.pendingReviews} pending review{coachSummary.pendingReviews !== 1 ? 's' : ''}</span>{' '}
          to complete.
        </p>
      </section>

      {/* ── SUMMARY BAR ── */}
      <section className="mb-10">
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

      {/* ── MAIN CONTENT GRID ── */}
      {/* Desktop: kolom kiri (2/3) + kolom kanan (1/3) */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

        {/* KOLOM KIRI */}
        <div className="flex flex-col gap-10 xl:col-span-2">

          {/* Upcoming Sessions */}
          <section>
            <SectionHeading eyebrow="Schedule" title="Upcoming Sessions" />
            <UpcomingSession sessions={upcomingSessions} />
          </section>

          {/* Active Coaching */}
          <section>
            <SectionHeading eyebrow="Coaching" title="Active Coaching" />
            <ActiveCoaching coachingList={activeCoachingList} />
          </section>

        </div>

        {/* KOLOM KANAN */}
        <div className="flex flex-col gap-10">

          {/* Pending Tasks */}
          <section>
            <SectionHeading eyebrow="Action Required" title="Pending Tasks" />
            <PendingTasks tasks={pendingTasks} />
          </section>

          {/* Balance */}
          <section>
            <SectionHeading eyebrow="Wallet" title="Balance" />
            <BalancePanel wallet={coachWallet} />
          </section>

        </div>

      </div>
    </CoachLayout>
  )
}

export default CoachDashboard
