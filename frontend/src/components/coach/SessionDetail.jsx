import { useState } from 'react'
import { Link } from 'react-router'
import { createCoachSchedule, completeCoachSession, updateCoachSession } from '../../api/coach'
import { laneLabel } from '../../data/coaches'
import { OFFSET, inputPlusHour, longDate, hasEnded, shiftInput, statusOf, timeOf, toInput } from '../../utils/schedule'
import { useNow } from '../../hooks/useNow'
import { btn, card, input } from './ui'

import artGold from '../../assets/roles/art/gold.webp'
import artExp from '../../assets/roles/art/exp.webp'
import artMid from '../../assets/roles/art/mid.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

const ART = { gold: artGold, exp: artExp, mid: artMid, jungle: artJungle, roam: artRoam }

// First-time scheduling for a session with no date yet. End = start + 60 min (auto).
// The backend creates the Google Calendar event + Meet link; the link field appears after scheduling.
const CreateScheduleForm = ({ s, onSaved, onMoved }) => {
  const [when, setWhen] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const autoEnd = when ? toInput(inputPlusHour(when)) : ''

  const create = async () => {
    if (!when) return setError('Pick a date and time.')
    setBusy(true); setError('')
    try {
      const scheduledAt = `${when}:00${OFFSET}`
      await createCoachSchedule(s.id, { scheduledAt, scheduledEnd: inputPlusHour(when) })
      await onSaved()
      onMoved(scheduledAt)
    } catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">This session has no schedule yet. Pick a start time — the end is set to +60 minutes automatically.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-white/60">Start
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={`${input} mt-1`} />
        </label>
        <label className="block text-xs text-white/60">End (auto)
          <input type="datetime-local" value={autoEnd} disabled className={`${input} mt-1`} />
        </label>
      </div>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <button type="button" onClick={create} disabled={busy} className={btn}>Create schedule</button>
    </div>
  )
}

// Always-visible form for an unfinished session. `onMoved` tells the page where the session went, so the board can follow it.
const ScheduleForm = ({ s, onSaved, onMoved }) => {
  const [when, setWhen] = useState(toInput(s.scheduledAt))
  const [end, setEnd] = useState(toInput(s.scheduledEnd))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const now = useNow()
  const ended = hasEnded(s, now)
  const onStartChange = (v) => {
    const prev = when && new Date(`${when}:00${OFFSET}`).getTime()
    const nextT = v && new Date(`${v}:00${OFFSET}`).getTime()
    if (Number.isFinite(prev) && Number.isFinite(nextT) && end) setEnd(shiftInput(end, nextT - prev))
    setWhen(v)
  }

  const run = async (action) => {
    setBusy(true); setError('')
    try { await action(); await onSaved() } catch (e) { setError(e.message) }
    setBusy(false)
  }
  const save = () => {
    if (!when || !end) return setError('Pick a start and end time.')
    const scheduledAt = `${when}:00${OFFSET}`
    const scheduledEnd = `${end}:00${OFFSET}`
    if (new Date(scheduledEnd) <= new Date(scheduledAt)) return setError('End time must be after start time.')
    run(async () => { await updateCoachSession(s.id, { scheduledAt, scheduledEnd }); onMoved(scheduledAt) })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-white/60">Start
          <input type="datetime-local" value={when} onChange={(e) => onStartChange(e.target.value)} className={`${input} mt-1`} />
        </label>
        <label className="block text-xs text-white/60">End (auto)
          <input type="datetime-local" value={end} disabled className={`${input} mt-1`} />
        </label>
      </div>
      {s.meetingLink && (
        <p className="text-sm text-white/60">
          Meet link: <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="break-all text-white/80 hover:text-white">{s.meetingLink}</a>
        </p>
      )}
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className={btn}>Save</button>
        <button type="button" onClick={() => run(() => completeCoachSession(s.id))} disabled={busy || !ended} className={btn}>Mark as completed</button>
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
          <p className="font-display text-4xl font-bold uppercase leading-tight text-white">{longDate(s.scheduledAt)} <span className="ml-2 text-white/70">{timeOf(s.scheduledAt)}{s.scheduledEnd ? ` – ${timeOf(s.scheduledEnd)}` : ''}</span></p>
          <h2 className="mt-4 truncate font-display text-xl font-bold uppercase leading-tight text-white">{o.player.name}</h2>
          <p className="text-xs text-white/60">{o.id.toUpperCase()} · {laneLabel(o.lane)} · Session {s.sessionNumber}/{s.totalSessions}</p>
          <p className={`mt-3 text-sm font-semibold ${tone}`}>{label}</p>
        </div>
        {s.status === 'completed' ? <LockedInfo s={s} /> : s.scheduledAt ? <ScheduleForm key={s.id} s={s} onSaved={onSaved} onMoved={onMoved} /> : <CreateScheduleForm key={s.id} s={s} onSaved={onSaved} onMoved={onMoved} />}
      </div>
    </section>
  )
}
export default SessionDetail
