import { laneLabel } from '../../data/coaches'
import { daysUntil, longDate, timeOf, untilLabel } from '../../utils/schedule'
import { btnDark } from './ui'

// The closest unfinished session. The button hands it to the page, which selects it on the board and scrolls to the panel.
// `s` is null when nothing is left to do.
const NextSessionCard = ({ s, o, today, onView }) => (
  <section aria-label="Next session" className="mb-6 rounded-md border border-white/10 bg-royal-600 p-6 md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.26em] text-periwinkle-300">Next session</p>
        {s ? (
          <>
            <p className="mt-2 font-display text-4xl font-bold uppercase leading-tight text-white">{longDate(s.scheduledAt)} <span className="ml-2">{timeOf(s.scheduledAt)}{s.scheduledEnd ? ` – ${timeOf(s.scheduledEnd)}` : ''}</span></p>
            <p className="mt-2 text-sm text-white/80">{o.player.name} · Session {s.sessionNumber}/{s.totalSessions} · {laneLabel(o.lane)} · {untilLabel(daysUntil(s.scheduledAt, today))}</p>
          </>
        ) : <p className="mt-2 font-display text-3xl font-bold uppercase text-white">No upcoming sessions</p>}
      </div>
      {s && <button type="button" onClick={onView} className={btnDark}>{s.scheduledAt ? 'View' : 'Schedule'}</button>}
    </div>
  </section>
)
export default NextSessionCard
