import { useState } from 'react'
import { saveCoachAvailability } from '../../api/coach'
import { BUFFER_HOURS, DAYS, HOURS, blockedSetForDay, countSlots, normalizeAvailability } from '../../data/availability'
import { btn, btnGhost, card } from './ui'

const label = 'block text-xs text-white/60'

// Weekly availability editor. Each slot is a 1-hour session start; picking one
// blocks the next BUFFER_HOURS slots that day (2-hour break), enforced both in
// the UI (blocked slots are disabled) and in the mock save validation.
const AvailabilityForm = ({ availability, onSaved }) => {
  const [week, setWeek] = useState(() => normalizeAvailability(availability))
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const toggle = (day, hour) => {
    const selected = week[day] ?? []
    if (selected.includes(hour)) {
      setWeek({ ...week, [day]: selected.filter((h) => h !== hour) })
    } else {
      if (blockedSetForDay(selected).has(hour)) return
      setWeek({ ...week, [day]: [...selected, hour].sort() })
    }
    setSaved(false); setError('')
  }

  const clearDay = (day) => { setWeek({ ...week, [day]: [] }); setSaved(false); setError('') }
  const clearAll = () => { setWeek(Object.fromEntries(DAYS.map((d) => [d.key, []]))); setSaved(false); setError('') }
  const copyMonday = () => { setWeek(Object.fromEntries(DAYS.map((d) => [d.key, [...(week.monday ?? [])]]))); setSaved(false); setError('') }
  const reset = () => { setWeek(normalizeAvailability(availability)); setError(''); setSaved(false) }

  const total = countSlots(week)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await saveCoachAvailability(week)
      await onSaved()
      setSaved(true)
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={save} className={`${card} space-y-5 p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold uppercase text-white">Weekly availability</h3>
          <p className="mt-1 max-w-[560px] text-xs text-white/60">
            Pick your 1-hour session start times for each day. The next {BUFFER_HOURS} hours after a pick are blocked for a break,
            so hours must be at least {BUFFER_HOURS + 1} hours apart (e.g. 09:00, then 12:00 or later).
          </p>
        </div>
        <span className="rounded-md border border-white/10 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-white/70">
          {total} slot{total === 1 ? '' : 's'}/week
        </span>
      </div>

      <div className="space-y-4">
        {DAYS.map(({ key, label: name }) => {
          const selected = week[key] ?? []
          const blocked = blockedSetForDay(selected)
          return (
            <div key={key} className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-white">
                  {name} <span className="ml-1 text-xs font-normal normal-case text-white/40">{selected.length ? `${selected.length} picked` : 'off'}</span>
                </p>
                {selected.length > 0 && (
                  <button type="button" onClick={() => clearDay(key)} disabled={busy} className="text-xs font-semibold uppercase tracking-wide text-periwinkle-300 hover:text-white disabled:opacity-40">
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {HOURS.map((h) => {
                  const on = selected.includes(h)
                  const off = !on && blocked.has(h)
                  return (
                    <button
                      key={h} type="button" aria-pressed={on} disabled={off || busy} onClick={() => toggle(key, h)}
                      title={off ? `${h}: blocked (break after a nearby session)` : `${h}: 1-hour session`}
                      className={`rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${on ? 'border-white bg-white font-semibold text-navy-950' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <button type="button" onClick={copyMonday} disabled={busy} className={btnGhost}>Copy Monday to all</button>
        <button type="button" onClick={clearAll} disabled={busy} className={btnGhost}>Clear all</button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-white/40">
        <span className="inline-block h-3 w-3 rounded-sm border border-white bg-white" /> picked
        <span className="ml-3 inline-block h-3 w-3 rounded-sm border border-white/10" /> available
        <span className="ml-3 inline-block h-3 w-3 rounded-sm border border-white/10 bg-white/10 opacity-50" /> blocked (break)
      </div>

      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className={btn}>{busy ? 'Saving…' : 'Save availability'}</button>
        <button type="button" onClick={reset} disabled={busy} className={btnGhost}>Reset</button>
        {saved && <span role="status" className="text-xs text-white/70">Availability saved</span>}
      </div>
    </form>
  )
}

export default AvailabilityForm
