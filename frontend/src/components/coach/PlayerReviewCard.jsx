import { laneLabel } from '../../data/coaches'

import iconGold from '../../assets/roles/role-gold.png'
import iconExp from '../../assets/roles/role-exp.png'
import iconMid from '../../assets/roles/role-mid.png'
import iconJungle from '../../assets/roles/role-jungle.png'
import iconRoam from '../../assets/roles/role-roam.png'

const ICON = { gold: iconGold, exp: iconExp, mid: iconMid, jungle: iconJungle, roam: iconRoam }

import artGold from '../../assets/roles/art/gold.webp'
import artExp from '../../assets/roles/art/exp.webp'
import artMid from '../../assets/roles/art/mid.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

const ART = { gold: artGold, exp: artExp, mid: artMid, jungle: artJungle, roam: artRoam } // big lane pictures for the card top

// The small lane icon on a navy block (used in the review panel header). The icons are square glyphs, so they are fitted, not cropped.
// An unknown lane shows the player's initials instead. The caller sets the size and padding.
export const LaneArt = ({ order, className }) => {
  const icon = ICON[order.lane]
  const initials = order.player.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return (
    <div className={`bg-navy-950 ${className}`}>
      {icon
        ? <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-contain" />
        : <div className="flex h-full w-full items-center justify-center font-display text-4xl font-bold uppercase text-white/30">{initials}</div>}
    </div>
  )
}

// The three states of a finished order, read from the data itself.
const stateOf = (o) =>
  o.rating ? { badge: `Player rated you ${o.rating.rating}/5`, color: 'text-cyan-glow', action: 'View review' }
    : o.performanceReview ? { badge: 'Awaiting rating', color: 'text-white/70', action: 'Edit review' }
      : { badge: 'Needs review', color: 'text-gold-400', action: 'Write review' }

// Lane art on top (with the status badge), royal panel below, dark button at the bottom.
const PlayerReviewCard = ({ order, open, onOpen }) => {
  const st = stateOf(order)
  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-md border bg-navy-900/70 backdrop-blur-sm ${open ? 'border-white/40' : 'border-white/10'}`}>
      <div className="relative">
        {ART[order.lane]
          ? <img src={ART[order.lane]} alt="" aria-hidden="true" className="h-44 w-full rounded-t-md border-b border-white/10 object-cover object-top" />
          : <LaneArt order={order} className="h-44 w-full rounded-t-md border-b border-white/10" />}
        <span className={`absolute left-3 top-3 rounded-md bg-navy-950/80 px-2 py-1 font-display text-xs font-semibold uppercase tracking-wide ${st.color}`}>{st.badge}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 bg-royal-600 p-5">
        <p className="text-xs uppercase tracking-wide text-periwinkle-300">{laneLabel(order.lane)} / {order.id}</p>
        <h3 className="font-display text-2xl font-bold uppercase leading-tight text-white">{order.player.name}</h3>
        <p className="text-xs text-white/70">{order.totalSessions}/{order.totalSessions} sessions</p>
        <button type="button" onClick={onOpen} aria-expanded={open} aria-controls="review-panel"
          className="mt-auto inline-flex w-full items-center justify-center rounded-md bg-navy-950 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          {st.action}
        </button>
      </div>
    </article>
  )
}
export default PlayerReviewCard
