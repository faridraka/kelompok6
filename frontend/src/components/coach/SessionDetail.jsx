import { useState } from 'react'
import { Link } from 'react-router'
import { completeCoachSession, rescheduleCoachSession, scheduleCoachSession } from '../../api/coach'
import { laneLabel } from '../../data/coaches'
import { OFFSET, hasEnded, inputPlusHour, longDate, statusOf, timeOf, toInput } from '../../utils/schedule'
import { useNow } from '../../hooks/useNow'
import { btn, card, input } from './ui'

import artGold from '../../assets/roles/art/gold.webp'
import artExp from '../../assets/roles/art/exp.webp'
import artMid from '../../assets/roles/art/mid.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

const ART = { gold: artGold, exp: artExp, mid: artMid, jungle: artJungle, roam: artRoam }

// Real BE: new orders arrive with scheduledAt null (no Google event yet).
// The coach picks the time here: first schedule = POST /sessions/:id/schedule,
// changing an existing time = PUT /sessions/:id. Both send a 1-hour slot (ISO +07:00).
const ScheduleForm = ({ s, onSaved }) => {
  const [when, setWhen] = useState(() => toInput(s.scheduledAt))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isScheduled = !!s.scheduledAt

  const save = async (e) => {
    e.preventDefault()
    if (!when) return setError('Pick a date and time.')
    setBusy(true); setError('')
    try {
      const body = { scheduledAt: `${when}:00${OFFSET}`, scheduledEnd: inputPlusHour(when) }
      if (isScheduled) await rescheduleCoachSession(s.id, body)
      else await scheduleCoachSession(s.id, body)
      await onSaved()
    } catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block text-xs text-white/60">
        {isScheduled ? 'Reschedule to (Jakarta time)' : 'Schedule at (Jakarta time)'}
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={`${input} mt-1`} />
      </label>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={btn}>{busy ? 'Saving…' : isScheduled ? 'Reschedule' : 'Schedule session'}</button>
      </div>
      {!isScheduled && <p className="text-xs text-white/50">Scheduling creates the Google Meet link automatically.</p>}
    </form>
  )
}

// Scheduled sessions: read-only time + mark-as-completed once the session has ended.
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
        Meet link: {s.meetingLink
          ? <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="break-all text-white/80 hover:text-white">{s.meetingLink}</a>
          : <span className="text-white/50">none yet</span>}
      </p>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={complete} disabled={busy || !ended} className={btn}>Mark as completed</button>
        {!ended && <span className="text-xs text-white/50">Available after the session ends</span>}
      </div>
      <div className="border-t border-white/10 pt-4">
        <ScheduleForm s={s} onSaved={onSaved} />
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
  const order = o ?? { id: '', lane: '-', player: { name: 'Player' } }
  const [label, tone] = s.scheduledAt ? statusOf(s) : ['Not scheduled', 'text-gold-400']
  const art = ART[order.lane]
  const initials = String(order.player?.name ?? 'P').split(' ').map((w) => w[0]).join('').slice(0, 2)
  return (
    <section id="session-detail" className={`${card} mt-6 scroll-mt-24 overflow-hidden md:flex`}>
      <div className="relative h-44 shrink-0 border-b border-white/10 bg-navy-950 md:h-auto md:w-52 md:border-b-0 md:border-r">
        {art
          ? <img src={art} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-top" />
          : <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold uppercase text-white/30">{initials}</div>}
      </div>
      <div className="grid flex-1 gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="min-w-0">
          <p className="font-display text-4xl font-bold uppercase leading-tight text-white">{longDate(s.scheduledAt)} <span className="ml-2 text-white/70">{s.scheduledAt ? `${timeOf(s.scheduledAt)}${s.scheduledEnd ? ` – ${timeOf(s.scheduledEnd)}` : ''}` : ''}</span></p>
          <h2 className="mt-4 truncate font-display text-xl font-bold uppercase leading-tight text-white">{order.player?.name ?? 'Player'}</h2>
          <p className="text-xs text-white/60">{String(order.id).toUpperCase()} · {laneLabel(order.lane)} · Session {s.sessionNumber}/{s.totalSessions}</p>
          <p className={`mt-3 text-sm font-semibold ${tone}`}>{label}</p>
        </div>
        {s.status === 'completed'
          ? <LockedInfo s={s} />
          : s.scheduledAt
            ? <SessionInfo key={s.id} s={s} onSaved={onSaved} />
            : (
              <div className="space-y-4">
                <p className="text-sm text-white/60">This session has no date yet. Pick a time to create the Meet link.</p>
                <ScheduleForm key={s.id} s={s} onSaved={onSaved} />
              </div>
            )}
      </div>
    </section>
  )
}
export default SessionDetail
