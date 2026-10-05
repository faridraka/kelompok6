import { Link } from 'react-router'
import { laneLabel } from '../../data/coaches'
import { at } from './stats'
import { btnDark } from './ui'
import { useCountdown } from './useCountdown'

const two = (n) => String(n).padStart(2, '0')
const label = 'font-display text-xs font-semibold uppercase tracking-[0.26em] text-periwinkle-300'

const Box = ({ value, unit }) => (
  <div className="w-16 rounded-md bg-navy-950 py-2 text-center sm:w-20">
    <p className="font-display text-3xl font-bold leading-none text-white">{two(value)}</p>
    <p className="mt-1 font-display text-[10px] font-semibold uppercase tracking-wide text-periwinkle-300">{unit}</p>
  </div>
)

// The closest unfinished session: live countdown on the left, who / when / link status and the button on the right.
// Sits on the bottom edge of the hero. `next` is undefined when nothing is left to do.
const NextSession = ({ next, order }) => {
  const { started, days, hours, minutes } = useCountdown(next?.scheduledAt)
  return (
    <section aria-label="Next session" className="relative z-10 -mt-12 mx-auto max-w-3xl rounded-md border border-white/10 bg-royal-600 p-6">
      {next ? (
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div>
            <p className={label}>Next session</p>
            {!next.scheduledAt
              ? <p className="mt-3 flex h-[62px] items-center font-display text-2xl font-bold uppercase leading-none text-white">Not scheduled yet</p>
              : started
              ? <p className="mt-3 flex h-[62px] items-center font-display text-4xl font-bold uppercase leading-none text-white">Started</p>
              : <div className="mt-3 flex gap-2"><Box value={days} unit="Days" /><Box value={hours} unit="Hrs" /><Box value={minutes} unit="Min" /></div>}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:border-l md:border-white/10 md:pl-6">
            <div className="min-w-0">
              <p className="truncate font-display text-2xl font-bold uppercase leading-tight text-white">{order.player.name}</p>
              <p className="mt-1 text-sm text-white/85">Session {next.sessionNumber}/{next.totalSessions} · {laneLabel(order.lane)}</p>
              <p className="text-sm text-white/85">
                {next.scheduledAt ? (
                  <>{at(next.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')} · {at(next.scheduledAt, { hour: '2-digit', minute: '2-digit' })}{next.scheduledEnd ? ` – ${at(next.scheduledEnd, { hour: '2-digit', minute: '2-digit' })}` : ''}</>
                ) : 'Not scheduled yet'}
              </p>
              <p className={`mt-1 text-sm font-semibold ${!next.scheduledAt ? 'text-gold-400' : 'text-white/85'}`}>{!next.scheduledAt ? 'Waiting for schedule' : 'Scheduled'}</p>
            </div>
            <Link to={`/coach/schedule?session=${next.id}`} className={`${btnDark} shrink-0`}>{next.scheduledAt ? 'View' : 'Schedule'}</Link>
          </div>
        </div>
      ) : (
        <div>
          <p className={label}>Next session</p>
          <p className="mt-2 font-display text-3xl font-bold uppercase text-white">No upcoming sessions</p>
        </div>
      )}
    </section>
  )
}
export default NextSession
