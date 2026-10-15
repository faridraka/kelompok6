import { laneLabel } from '../../data/coaches'
import { DAY_KEYS, countSlots, dayLabel } from '../../data/availability'
import { card } from './ui'
import { laneIcon } from './laneIcons'

// Read-only side of the profile page: photo, name, rating and the lanes. Everything comes from the saved profile.
const ProfileSummary = ({ coach, stats, availability }) => {
  const initials = coach.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  const total = availability ? countSlots(availability) : 0
  const activeDays = availability ? DAY_KEYS.filter((k) => (availability[k] ?? []).length) : []
  return (
    <div className={`${card} flex flex-col items-center p-6 text-center`}>
      {coach.avatar
        ? <img src={coach.avatar} alt="" className="h-32 w-32 rounded-full border border-white/10 object-cover" />
        : <div aria-hidden="true" className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10 font-display text-4xl font-bold uppercase text-white/70">{initials}</div>}
      <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-white">{coach.name}</h2>
      <p className="mt-3 font-display text-lg font-bold text-cyan-glow">{stats.n ? `Rated ${stats.avg.toFixed(1)}/5` : 'No ratings yet'}</p>
      <ul className="mt-5 flex flex-wrap justify-center gap-4 border-t border-white/10 pt-5">
        {coach.lanes.map((lane) => (
          <li key={lane} className="flex items-center gap-2">
            <img src={laneIcon(lane)} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-white">{laneLabel(lane)}</span>
          </li>
        ))}
      </ul>
      {availability && (
        <div className="mt-5 w-full border-t border-white/10 pt-5 text-left">
          <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
            Available {total} slot{total === 1 ? '' : 's'}/week
          </p>
          {activeDays.length ? (
            <ul className="mt-3 space-y-1.5">
              {activeDays.map((k) => (
                <li key={k} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-white/50">{dayLabel(k).slice(0, 3)}</span>
                  <span className="text-right font-mono text-white/80">{[...availability[k]].sort().join(', ')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-center text-xs text-white/40">No hours set yet</p>
          )}
        </div>
      )}
    </div>
  )
}
export default ProfileSummary
