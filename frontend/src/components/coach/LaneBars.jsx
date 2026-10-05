import { laneLabel } from '../../data/coaches'
import { plural } from './stats'
import { card } from './ui'

// Role icons: src/assets/roles/role-<lane>.png
const ICONS = import.meta.glob('../../assets/roles/role-*.png', { eager: true, import: 'default' })

// Max 3 lanes, most players first. `lanes` comes from laneCounts(); the bar is relative to the biggest lane.
const LaneBars = ({ lanes }) => {
  const top = Math.max(...lanes.map((l) => l.count), 1)
  return (
    <div className={`${card} h-full p-6`}>
      <h2 className="font-display text-xl font-bold uppercase text-white">Players by lane</h2>
      <p className="mt-1 text-sm text-white/60">Max 3 lanes per coach</p>
      {lanes.length ? (
        <ul className="mt-5 space-y-5">
          {lanes.map(({ lane, count }) => (
            <li key={lane} className="flex items-center gap-4">
              <img src={ICONS[`../../assets/roles/role-${lane}.png`]} alt="" aria-hidden="true" className="h-10 w-10 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-bold uppercase leading-none text-white">{laneLabel(lane)}</span>
                  <span className="text-sm text-white/70">{plural(count, 'player')}</span>
                </div>
                <div className="mt-2 h-2 rounded-md bg-white/20"><div className="h-full rounded-md bg-white" style={{ width: `${(count / top) * 100}%` }} /></div>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 text-sm text-white/60">No players yet</p>}
    </div>
  )
}
export default LaneBars
