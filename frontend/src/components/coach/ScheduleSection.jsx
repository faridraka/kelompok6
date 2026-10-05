import { useState } from 'react'
import { completeCoachSession, updateCoachSession } from '../../api/coach'
import { laneLabel } from '../../data/coaches'
import { hasEnded, shiftInput } from '../../utils/schedule'
import { useNow } from '../../hooks/useNow'
import { Pill, fmtRange } from '../player/ui'
import { goTo } from './sections'
import { Empty, btn, btnGhost, card, input } from './ui'

const TZ = 'Asia/Jakarta'
const OFFSET = '+07:00' // Jakarta has no daylight saving, so a fixed offset is safe
const FILTERS = [['all', 'All'], ['scheduled', 'Upcoming'], ['completed', 'Completed']]
// "2026-10-03T20:00:00+07:00" -> "2026-10-03T20:00" (the format <input type="datetime-local"> wants)
const toInput = (iso) => (iso ? new Date(iso).toLocaleString('sv-SE', { timeZone: TZ }).slice(0, 16).replace(' ', 'T') : '')
const rowPad = 'px-5 py-3'

// Inline edit form: it replaces the row. It starts fresh every time it opens.
const EditForm = ({ s, onDone, onSaved }) => {
  const [at, setAt] = useState(toInput(s.scheduledAt))
  const [end, setEnd] = useState(toInput(s.scheduledEnd))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // End follows Start automatically, keeping the existing duration (not a fixed +60 min).
  const onStartChange = (v) => {
    const prev = at && new Date(`${at}:00${OFFSET}`).getTime()
    const nextT = v && new Date(`${v}:00${OFFSET}`).getTime()
    if (Number.isFinite(prev) && Number.isFinite(nextT) && end) setEnd(shiftInput(end, nextT - prev))
    setAt(v)
  }

  const save = async () => {
    if (!at || !end) return setError('Pick a start and end time.')
    if (new Date(`${end}:00${OFFSET}`) <= new Date(`${at}:00${OFFSET}`)) return setError('End time must be after start time.')
    setBusy(true); setError('')
    try { await updateCoachSession(s.id, { scheduledAt: `${at}:00${OFFSET}`, scheduledEnd: `${end}:00${OFFSET}` }); await onSaved(); onDone() }
    catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className={`${rowPad} space-y-3 bg-white/5`}>
      <p className="text-sm font-semibold text-white">Session {s.sessionNumber}/{s.totalSessions}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-white/60">Start
          <input type="datetime-local" value={at} onChange={(e) => onStartChange(e.target.value)} className={`${input} mt-1`} />
        </label>
        <label className="block text-xs text-white/60">End (auto)
          <input type="datetime-local" value={end} disabled className={`${input} mt-1`} />
        </label>
      </div>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={busy} className={btn}>Save</button>
        <button type="button" onClick={onDone} disabled={busy} className={btnGhost}>Cancel</button>
      </div>
    </div>
  )
}

const ViewRow = ({ s, onEdit, onSaved }) => {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const done = s.status === 'completed'
  const ended = hasEnded(s, useNow())

  const complete = async () => {
    setBusy(true); setError('')
    try { await completeCoachSession(s.id); await onSaved() }
    catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className={`${rowPad} grid items-center gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-[6rem_11rem_6rem_7rem_1fr]`}>
      <p className="text-sm font-semibold text-white">Session {s.sessionNumber}/{s.totalSessions}</p>
      <p className="text-sm text-white/60">{s.scheduledAt ? fmtRange(s.scheduledAt, s.scheduledEnd, TZ) : <span className="text-gold-400">Not scheduled yet</span>}</p>
      <p className={`text-sm font-semibold ${done ? 'text-cyan-glow' : 'text-white/60'}`}>{done ? 'Completed' : 'Upcoming'}</p>
      <p className="text-sm text-white/60">{s.meetingLink ? <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">Meet link</a> : <span className="text-white/40">-</span>}</p>
      <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1 lg:items-end">
        {done ? (
          // Completed = locked. Only the recording status is shown.
          s.vod ? <span className="text-sm text-white/60">Recording added</span>
            : <button type="button" onClick={() => goTo('records')} className="text-sm font-semibold text-gold-400 hover:underline">Add recording →</button>
        ) : (
          <>
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(s.id)} disabled={busy} className={btnGhost}>Edit</button>
              <button type="button" onClick={complete} disabled={busy || !ended} className={btn}>Mark as completed</button>
            </div>
            {!ended && <p className="text-xs text-white/50">Available after the session ends</p>}
          </>
        )}
        {error && <p className="text-xs text-gold-400">{error}</p>}
      </div>
    </div>
  )
}

// Section "Schedule". `editId` is shared with the dashboard, so the button up there can open a row's form.
const ScheduleSection = ({ orders, sessions, editId, onEdit, onSaved }) => {
  const [filter, setFilter] = useState('all')
  const byDate = (a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? '')
  const shown = (s) => filter === 'all' || s.status === filter || s.id === editId // the row being edited never disappears
  const nextDate = (all) => all.filter((s) => s.status === 'scheduled').sort(byDate)[0]?.scheduledAt ?? '~' // '~' sorts last

  // Orders with upcoming sessions first (earliest first), finished orders after.
  const groups = orders
    .map((o) => { const all = sessions.filter((s) => s.orderId === o.id); return { o, all, list: all.filter(shown).sort(byDate) } })
    .filter((g) => g.list.length)
    .sort((a, b) => nextDate(a.all).localeCompare(nextDate(b.all)))

  return (
    <section id="schedule" className="scroll-mt-24">
      <h2 className="mb-3 font-display text-xl font-bold uppercase text-white">Schedule</h2>
      <div className="mb-5 flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Pill>)}</div>
      {groups.length ? (
        <div className="space-y-6">
          {groups.map(({ o, all, list }) => (
            <div key={o.id} className={card}>
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div>
                  <h3 className="font-display text-lg font-bold uppercase text-white">{o.player.name}</h3>
                  <p className="text-xs text-white/60">{o.id.toUpperCase()} · {laneLabel(o.lane)}</p>
                </div>
                <p className="text-sm text-white/60">{all.filter((s) => s.status === 'completed').length}/{o.totalSessions} completed</p>
              </div>
              {list.map((s) => (
                <div key={s.id} id={`session-${s.id}`} className="scroll-mt-24 border-b border-white/10 last:border-b-0">
                  {editId === s.id
                    ? <EditForm s={s} onDone={() => onEdit(null)} onSaved={onSaved} />
                    : <ViewRow s={s} onEdit={onEdit} onSaved={onSaved} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : <Empty>No sessions to show.</Empty>}
    </section>
  )
}
export default ScheduleSection
