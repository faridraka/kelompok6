import { laneLabel } from '../../data/coaches'
import { card } from './ui'
import { laneIcon } from './laneIcons'

// Read-only side of the profile page: photo, name, academy, rating and the lanes. Everything comes from the saved profile.
const ProfileSummary = ({ coach, stats }) => {
  const initials = coach.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return (
    <div className={`${card} flex flex-col items-center p-6 text-center`}>
      {coach.avatar
        ? <img src={coach.avatar} alt="" className="h-32 w-32 rounded-full border border-white/10 object-cover" />
        : <div aria-hidden="true" className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10 font-display text-4xl font-bold uppercase text-white/70">{initials}</div>}
      <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-white">{coach.name}</h2>
      <p className="mt-1 text-sm text-white/70">{coach.academyLabel}</p>
      <p className="mt-3 font-display text-lg font-bold text-cyan-glow">{stats.n ? `Rated ${stats.avg.toFixed(1)}/5` : 'No ratings yet'}</p>
      <ul className="mt-5 flex flex-wrap justify-center gap-4 border-t border-white/10 pt-5">
        {coach.lanes.map((lane) => (
          <li key={lane} className="flex items-center gap-2">
            <img src={laneIcon(lane)} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-white">{laneLabel(lane)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default ProfileSummary
