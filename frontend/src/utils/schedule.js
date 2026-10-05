// Helpers for the Schedule week board. Every day is a Jakarta calendar day written as "YYYY-MM-DD",
// so the board needs no timezone or daylight-saving math (Jakarta has none).
export const TZ = 'Asia/Jakarta'
export const OFFSET = '+07:00'

export const dayKey = (iso) => (iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ }) : '') // "2026-10-05"
export const addDays = (key, n) => new Date(Date.parse(`${key}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10)
export const mondayOf = (key) => addDays(key, -((new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7))

const part = (key, opts) => new Date(`${key}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts })
export const dayName = (key) => part(key, { weekday: 'short' })
export const dayNumber = (key) => part(key, { day: 'numeric' })
// "5 – 11 Oct 2026", or "28 Sep – 4 Oct 2026" when the week crosses a month.
export const rangeLabel = (start) => {
  const end = addDays(start, 6)
  const sameMonth = part(start, { month: 'numeric' }) === part(end, { month: 'numeric' })
  return `${dayNumber(start)}${sameMonth ? '' : ` ${part(start, { month: 'short' })}`} – ${part(end, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export const timeOf = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) : '–')
export const longDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }) : 'Not scheduled yet')
// "2026-10-03T20:00:00+07:00" -> "2026-10-03T20:00" (the format <input type="datetime-local"> wants)
export const toInput = (iso) => (iso ? new Date(iso).toLocaleString('sv-SE', { timeZone: TZ }).slice(0, 16).replace(' ', 'T') : '')

// True once the session's end time has passed. No end date = not endable yet.
export const hasEnded = (s, now = Date.now()) =>
  !!s?.scheduledEnd && !Number.isNaN(new Date(s.scheduledEnd).getTime()) && now >= new Date(s.scheduledEnd).getTime()

export const hourOf = (iso) => { if (!iso) return null; return Number(timeOf(iso).slice(0, 2)) % 24 }
// Shift a datetime-local value (Jakarta wall time) by deltaMs, returning datetime-local.
export const shiftInput = (input, deltaMs) => {
  if (!input || !Number.isFinite(deltaMs)) return input ?? ''
  const d = new Date(new Date(`${input}:00${OFFSET}`).getTime() + deltaMs)
  if (Number.isNaN(d.getTime())) return input
  return d.toLocaleString('sv-SE', { timeZone: TZ }).slice(0, 16).replace(' ', 'T')
}
// "2026-10-05T19:00" (datetime-local, Jakarta wall time) -> "2026-10-05T20:00:00+07:00" (+60 min)
export const inputPlusHour = (when) => {
  if (!when) return ''
  const end = new Date(new Date(`${when}:00${OFFSET}`).getTime() + 3600e3)
  return `${end.toLocaleString('sv-SE', { timeZone: TZ }).slice(0, 19).replace(' ', 'T')}${OFFSET}`
}
// Whole days from today to the session's day (both are Jakarta days), and how the NEXT card words it.
export const daysUntil = (iso, today) => {
  if (!iso) return null
  return Math.round((Date.parse(`${dayKey(iso)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 864e5)
}
export const untilLabel = (n) => (n == null ? 'not scheduled yet' : (n < 0 ? 'overdue' : n === 0 ? 'today' : `in ${n} day${n === 1 ? '' : 's'}`))

// Hours on the board's time axis, from the hours of the visible sessions: every hour from the earliest to the latest
// (at least 3 rows). If they are spread over more than 10 hours, only the hours that have a session are listed.
export const axisHours = (hours) => {
  const hs = hours.filter((h) => Number.isFinite(h))
  if (!hs.length) return []
  let from = Math.min(...hs)
  let to = Math.max(...hs)
  if (to - from > 9) return [...new Set(hs)].sort((a, b) => a - b)
  while (to - from < 2) {
    if (to < 23) to += 1
    else from -= 1
  }
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

// Status text and colour. Cyan = completed, gold = needs action.
export const statusOf = (s) =>
  s.status === 'completed' ? ['Completed', 'text-cyan-glow']
  : !s.scheduledAt ? ['Waiting for schedule', 'text-gold-400']
  : ['Scheduled', 'text-white/80']
