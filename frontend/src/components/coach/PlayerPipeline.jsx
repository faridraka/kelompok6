import { Link } from 'react-router'
import { stageOf } from './stats'

import iconGold from '../../assets/roles/role-gold.png'
import iconExp from '../../assets/roles/role-exp.png'
import iconMid from '../../assets/roles/role-mid.png'
import iconJungle from '../../assets/roles/role-jungle.png'
import iconRoam from '../../assets/roles/role-roam.png'

const ICON = { gold: iconGold, exp: iconExp, mid: iconMid, jungle: iconJungle, roam: iconRoam }
const COLUMNS = [['sessions', 'In sessions'], ['due', 'Review due'], ['awaiting', 'Awaiting rating'], ['rated', 'Rated']]
const byDate = (a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? '')

// What a card says and where it goes. Gold = needs action, cyan = rated.
const cardInfo = (stage, o, list) => {
  const all = `${o.totalSessions}/${o.totalSessions} sessions`
  const reviews = `/coach/reviews?order=${o.id}`
  if (stage === 'due') return { meta: all, flag: 'Write review', gold: true, to: reviews }
  if (stage === 'awaiting') return { meta: 'Review sent', to: reviews }
  if (stage === 'rated') return { meta: `Player rated you ${o.rating.rating}/5`, cyan: true, to: reviews }
  const first = (test) => list.filter(test).sort(byDate)[0]
  const noSchedule = first((s) => s.status === 'scheduled' && !s.scheduledAt)
  const noVod = first((s) => s.status === 'completed' && !s.vod)
  const meta = `${list.filter((s) => s.status === 'completed').length}/${o.totalSessions} sessions`
  if (noSchedule) return { meta, flag: 'Needs schedule', gold: true, to: `/coach/schedule?session=${noSchedule.id}` }
  if (noVod) return { meta, flag: 'Recording missing', gold: true, to: `/coach/records?session=${noVod.id}` }
  return { meta, flag: 'On track', to: `/coach/schedule?session=${first((s) => s.status === 'scheduled').id}` }
}

// Four columns, one per stage. Each order is a small card that links to the page where the coach acts.
const PlayerPipeline = ({ orders, sessions }) => {
  const staged = orders.map((o) => {
    const list = sessions.filter((s) => s.orderId === o.id)
    const stage = stageOf(o, list)
    return { o, stage, info: cardInfo(stage, o, list) }
  })
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {COLUMNS.map(([key, title]) => {
        const items = staged.filter((x) => x.stage === key)
        return (
          <div key={key}>
            <div className="mb-3 flex items-baseline justify-between border-b border-white/10 pb-2">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
              <span className="text-sm text-white/60">{items.length}</span>
            </div>
            {items.length ? (
              <div className="space-y-2">
                {items.map(({ o, info }) => (
                  <Link key={o.id} to={info.to} className="flex items-center gap-3 rounded-md border border-white/10 bg-navy-900/70 p-3 backdrop-blur-sm transition-colors hover:border-white/30">
                    {ICON[o.lane] && <img src={ICON[o.lane]} alt="" className="h-10 w-10 shrink-0 object-contain" />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{o.player.name}</p>
                      <p className={`text-xs ${info.cyan ? 'text-cyan-glow' : 'text-white/60'}`}>
                        {info.meta}
                        {info.flag && <> · <span className={info.gold ? 'font-semibold text-gold-400' : ''}>{info.flag}</span></>}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-white/40">None</p>}
          </div>
        )
      })}
    </div>
  )
}
export default PlayerPipeline
