import { laneLabel } from '../../data/coaches'
import { card } from './ui'

import artGold from '../../assets/roles/art/gold.webp'
import artExp from '../../assets/roles/art/exp.webp'
import artMid from '../../assets/roles/art/mid.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

const ART = { gold: artGold, exp: artExp, mid: artMid, jungle: artJungle, roam: artRoam }

// Same structure as the role card on the landing page (Roles.jsx): art on top, blue panel below, dark button.
const CoachedPlayerCard = ({ order, onView }) => {
  const art = ART[order.lane]
  const initials = order.player.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return (
    <article className={`${card} flex h-full flex-col overflow-hidden`}>
      <div className="relative aspect-[3/4] overflow-hidden border-b border-white/10 bg-navy-950">
        {art
          ? <img src={art} alt="" aria-hidden="true" className="h-full w-full object-cover object-top" />
          : <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-white/30">{initials}</div>}
      </div>
      <div className="flex flex-1 flex-col gap-3 bg-royal-600 p-5">
        <p className="text-xs uppercase tracking-wide text-periwinkle-300">{laneLabel(order.lane)} / Completed</p>
        <h3 className="font-display text-2xl font-bold uppercase leading-tight text-white">{order.player.name}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-white/85">{order.performanceReview.notes}</p>
        <div className="mt-auto flex flex-col gap-3">
          <p className="text-xs text-white/70">{order.totalSessions}/{order.totalSessions} sessions · {order.rating ? `Player rated you ${order.rating.rating}/5` : 'Awaiting rating'}</p>
          <button type="button" onClick={onView}
            className="inline-flex items-center justify-center gap-3 rounded-md bg-navy-950 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            View review
            <svg viewBox="0 0 8 12" className="h-3 w-2 fill-current" aria-hidden="true"><path d="M0 0l8 6-8 6z" /></svg>
          </button>
        </div>
      </div>
    </article>
  )
}
export default CoachedPlayerCard
