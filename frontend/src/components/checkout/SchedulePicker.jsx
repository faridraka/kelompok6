import { normalizeAvailability } from '../../data/availability'

export const SCHEDULE_COUNT = 3
const WINDOW_DAYS = 14
const BOOKING_BUFFER_MS = 60 * 60 * 1000 // slots must start at least 1h from now

const slotIso = (ymd, hour) => `${ymd}T${hour}:00+07:00`

const dayDisplay = (ymd) =>
  new Date(`${ymd}T12:00:00+07:00`).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta',
  })

export const formatSlot = (iso) => {
  const [ymd, rest] = iso.split('T')
  return `${dayDisplay(ymd)} · ${rest.slice(0, 5)}`
}

// Bookable 1-hour starts for the next WINDOW_DAYS, taken from the coach's
// weekly availability. Past slots today (within the booking buffer) are hidden.
// bookedSlots = starts other players already hold (ISO strings); compared by
// epoch, because the DB serialises timestamps in a different offset format.
const buildOptions = (availability, bookedSlots = []) => {
  const av = normalizeAvailability(availability)
  const booked = new Set(
    bookedSlots.map((iso) => new Date(iso).getTime()).filter(Number.isFinite),
  )
  const nowJakarta = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const days = []
  for (let offset = 0; offset < WINDOW_DAYS; offset++) {
    const base = new Date(Date.now() + offset * 864e5)
    const ymd = base.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    const weekday = base.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Jakarta' }).toLowerCase()
    let hours = [...(av[weekday] ?? [])].sort()
    if (offset === 0) {
      hours = hours.filter((h) => new Date(slotIso(ymd, h)).getTime() - nowJakarta.getTime() > BOOKING_BUFFER_MS)
    }
    hours = hours.filter((h) => !booked.has(new Date(slotIso(ymd, h)).getTime()))
    if (hours.length) days.push({ ymd, display: dayDisplay(ymd), hours })
  }
  return days
}

// Pick exactly SCHEDULE_COUNT session times from the coach's availability.
// value: ISO strings (YYYY-MM-DDTHH:00:00+07:00), sorted ascending.
const SchedulePicker = ({ availability, bookedSlots, value, onChange }) => {
  const days = buildOptions(availability, bookedSlots)
  const picked = [...value].sort()
  const full = picked.length >= SCHEDULE_COUNT

  const toggle = (iso) => {
    if (picked.includes(iso)) onChange(picked.filter((s) => s !== iso))
    else if (!full) onChange([...picked, iso].sort())
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {picked.length}/{SCHEDULE_COUNT} sessions picked
        </p>
        <p className="text-xs text-white/40">1-hour sessions · Jakarta time</p>
      </div>

      {picked.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {picked.map((s, i) => (
            <li key={s} className="flex items-center gap-2 rounded-md border border-white bg-white px-3 py-1.5 text-xs font-semibold text-navy-950">
              <span className="font-display">#{i + 1}</span> {formatSlot(s)}
              <button type="button" onClick={() => toggle(s)} aria-label={`Remove ${formatSlot(s)}`} className="font-bold hover:opacity-60">×</button>
            </li>
          ))}
        </ul>
      )}

      {days.length === 0 ? (
        <p className="mt-4 text-sm text-white/50">This coach hasn&apos;t set any availability yet.</p>
      ) : (
        <div className="mt-4 max-h-[380px] space-y-4 overflow-y-auto pr-1">
          {days.map(({ ymd, display, hours }) => (
            <div key={ymd}>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{display}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {hours.map((h) => {
                  const iso = slotIso(ymd, h)
                  const on = picked.includes(iso)
                  const disabled = !on && full
                  return (
                    <button
                      key={iso} type="button" aria-pressed={on} disabled={disabled} onClick={() => toggle(iso)}
                      className={`rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${on ? 'border-white bg-white font-semibold text-navy-950' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SchedulePicker
