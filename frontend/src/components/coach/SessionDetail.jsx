import { useState } from 'react'
import { Link } from 'react-router'
import { completeCoachSession, updateCoachSession } from '../../api/coach'
import { laneLabel } from '../../data/coaches'
import { OFFSET, longDate, statusOf, timeOf, toInput } from '../../utils/schedule'
import { btn, card, input } from './ui'

import artGold from '../../assets/roles/art/gold.webp'
import artExp from '../../assets/roles/art/exp.webp'
import artMid from '../../assets/roles/art/mid.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

const ART = { gold: artGold, exp: artExp, mid: artMid, jungle: artJungle, roam: artRoam }
const validLink = (v) => /^https?:\/\/\S+$/i.test(v)

// Always-visible form for an unfinished session. `onMoved` tells the page where the session went, so the board can follow it.
const ScheduleForm = ({ s, onSaved, onMoved }) => {
  const [when, setWhen] = useState(toInput(s.scheduledAt))
  const [link, setLink] = useState(s.meetingLink ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (action) => {
    setBusy(true); setError('')
    try { await action(); await onSaved() } catch (e) { setError(e.message) }
    setBusy(false)
  }
  const save = () => {
    if (!when) return setError('Pick a date and time.')
    if (link.trim() && !validLink(link.trim())) return setError('Link must start with http:// or https://')
    const scheduledAt = `${when}:00${OFFSET}`
    run(async () => { await updateCoachSession(s.id, { scheduledAt, meetingLink: link.trim() || null }); onMoved(scheduledAt) })
  }

  return (
    <div className="space-y-4">
      <label className="block text-xs text-white/60">Date and time
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={`${input} mt-1`} />
      </label>
      <label className="block text-xs text-white/60">Meeting link
        <input type="text" inputMode="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} className={`${input} mt-1`} />
      </label>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className={btn}>Save</button>
        <button type="button" onClick={() => run(() => completeCoachSession(s.id))} disabled={busy || !s.meetingLink} className={btn}>Mark as completed</button>
        {!s.meetingLink && <span className="text-xs text-white/50">Add a meeting link first</span>}
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

// The panel under the board: lane art on the left, then the session summary and the form (or locked info).
const SessionDetail = ({ s, o, onSaved, onMoved }) => {
  const [label, tone] = statusOf(s)
  const art = ART[o.lane]
  const initials = o.player.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return (
    <section id="session-detail" className={`${card} mt-6 scroll-mt-24 overflow-hidden md:flex`}>
      <div className="relative h-44 shrink-0 border-b border-white/10 bg-navy-950 md:h-auto md:w-52 md:border-b-0 md:border-r">
        {art
          ? <img src={art} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-top" />
          : <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold uppercase text-white/30">{initials}</div>}
      </div>
      <div className="grid flex-1 gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="min-w-0">
          <p className="font-display text-4xl font-bold uppercase leading-tight text-white">{longDate(s.scheduledAt)} <span className="ml-2 text-white/70">{timeOf(s.scheduledAt)}</span></p>
          <h2 className="mt-4 truncate font-display text-xl font-bold uppercase leading-tight text-white">{o.player.name}</h2>
          <p className="text-xs text-white/60">{o.id.toUpperCase()} · {laneLabel(o.lane)} · Session {s.sessionNumber}/{s.totalSessions}</p>
          <p className={`mt-3 text-sm font-semibold ${tone}`}>{label}</p>
        </div>
        {s.status === 'completed' ? <LockedInfo s={s} /> : <ScheduleForm key={s.id} s={s} onSaved={onSaved} onMoved={onMoved} />}
      </div>
    </section>
  )
}
export default SessionDetail
