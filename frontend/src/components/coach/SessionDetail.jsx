import { useState } from 'react'
import { Link } from 'react-router'
import { completeCoachSession } from '../../api/coach'
import { laneLabel } from '../../data/coaches'
import { hasEnded, longDate, statusOf, timeOf } from '../../utils/schedule'
import { useNow } from '../../hooks/useNow'
import { btn, card } from './ui'

import artGold from '../../assets/roles/art/gold.webp'
import artExp from '../../assets/roles/art/exp.webp'
import artMid from '../../assets/roles/art/mid.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

const ART = { gold: artGold, exp: artExp, mid: artMid, jungle: artJungle, roam: artRoam }

// Sessions are picked by the player at checkout and fixed: the time below is
// read-only. The coach only marks the session as completed once it has ended.
const SessionInfo = ({ s, onSaved }) => {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ended = hasEnded(s, useNow())

  const complete = async () => {
    setBusy(true); setError('')
    try { await completeCoachSession(s.id); await onSaved() }
    catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Meet link: <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="break-all text-white/80 hover:text-white">{s.meetingLink}</a>
      </p>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={complete} disabled={busy || !ended} className={btn}>Mark as completed</button>
        {!ended && <span className="text-xs text-white/50">Available after the session ends</span>}
      </div>
    </div>
  )
}

// Completed sessions are locked: link, status and recording only.
const LockedInfo = ({ s }) => (
  <div className="space-y-3 text-sm">
    <p className="text-white/60">
      Meeting link: {s.meetingLink
        ? <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="break-all text-white/80 hover:text-white">{s.meetingLink}</a>
        : <span className="text-white/50">none</span>}
    </p>
    {s.vod ? <p className="text-white/60">Recording added</p>
      : <Link to={`/coach/records?session=${s.id}`} className="font-semibold text-gold-400 hover:underline">Add recording →</Link>}
  </div>
)

// The panel under the board: lane art on the left, then the session summary and the action (or locked info).
const SessionDetail = ({ s, o, onSaved }) => {
  const [label, tone] = statusOf(s)
  const art = o ? ART[o.lane] : null
  const initials = o?.player?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2) || '?'
  return (
    <section id="session-detail" className={`${card} mt-6 scroll-mt-24 overflow-hidden md:flex`}>
      <div className="relative h-44 shrink-0 border-b border-white/10 bg-navy-950 md:h-auto md:w-52 md:border-b-0 md:border-r">
        {art
          ? <img src={art} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-top" />
          : <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold uppercase text-white/30">{initials}</div>}
      </div>
      <div className="grid flex-1 gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="min-w-0">
          <p className="font-display text-4xl font-bold uppercase leading-tight text-white">{longDate(s.scheduledAt)} <span className="ml-2 text-white/70">{timeOf(s.scheduledAt)}{s.scheduledEnd ? ` – ${timeOf(s.scheduledEnd)}` : ''}</span></p>
          <h2 className="mt-4 truncate font-display text-xl font-bold uppercase leading-tight text-white">{o?.player?.name ?? 'Player'}</h2>
          <p className="text-xs text-white/60">{o?.id?.toUpperCase() ?? '—'} · {laneLabel(o?.lane)} · Session {s.sessionNumber}/{s.totalSessions}</p>
          <p className={`mt-3 text-sm font-semibold ${tone}`}>{label}</p>
        </div>
        {s.status === 'completed' ? <LockedInfo s={s} /> : <SessionInfo key={s.id} s={s} onSaved={onSaved} />}
      </div>
    </section>
  )
}
export default SessionDetail
