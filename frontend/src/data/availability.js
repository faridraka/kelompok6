// Weekly availability for coaches (frontend + mock only).
// Shape: { monday: ['09:00', ...], tuesday: [], ... sunday: [] }
// Each string is a 1-hour session start time. Sessions are 1 hour, then the
// coach needs a 2-hour break, so start times on the same day must be at
// least 3 hours apart (e.g. 09:00 blocks 10:00 and 11:00).

export const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

export const DAY_KEYS = DAYS.map((d) => d.key)
export const dayLabel = (key) => DAYS.find((d) => d.key === key)?.label ?? key

// Selectable 1-hour session start times.
export const START_HOUR = 8
export const END_HOUR = 22
export const BUFFER_HOURS = 2 // blocked hours after (and around) a selected slot
export const MIN_GAP = BUFFER_HOURS + 1 // selected start times must differ by >= 3h

export const hourLabel = (h) => `${String(h).padStart(2, '0')}:00`
export const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => hourLabel(START_HOUR + i))

const hourInt = (t) => Number(String(t).split(':')[0])

export const emptyAvailability = () =>
  Object.fromEntries(DAY_KEYS.map((k) => [k, []]))

// Keep only known days/hours, unique + sorted. Never throws.
export const normalizeAvailability = (av) => {
  const out = emptyAvailability()
  if (!av || typeof av !== 'object') return out
  for (const k of DAY_KEYS) {
    const list = Array.isArray(av[k]) ? av[k] : []
    out[k] = [...new Set(list.filter((t) => HOURS.includes(t)))].sort()
  }
  return out
}

// Hours on one day that cannot be picked because they are within BUFFER_HOURS
// of an already selected slot (both directions, so min distance stays 3h).
export const blockedSetForDay = (selected) => {
  const sel = selected.map(hourInt)
  const blocked = new Set()
  for (const h of HOURS) {
    const hi = hourInt(h)
    if (selected.includes(h)) continue
    if (sel.some((s) => Math.abs(hi - s) <= BUFFER_HOURS)) blocked.add(h)
  }
  return blocked
}

// Validate a full-week object. Returns an error string or null when valid.
export const validateAvailability = (av) => {
  if (!av || typeof av !== 'object') return 'Invalid availability.'
  for (const k of DAY_KEYS) {
    const list = av[k]
    if (!Array.isArray(list)) return `Invalid availability for ${dayLabel(k)}.`
    for (const t of list) {
      if (!HOURS.includes(t)) return `Invalid hour ${t} on ${dayLabel(k)}.`
    }
    const ints = [...new Set(list)].map(hourInt).sort((a, b) => a - b)
    for (let i = 1; i < ints.length; i++) {
      if (ints[i] - ints[i - 1] < MIN_GAP) {
        return `${dayLabel(k)}: sessions need a ${BUFFER_HOURS}-hour break, so pick hours at least ${MIN_GAP} hours apart (e.g. ${hourLabel(ints[i - 1])} then ${hourLabel(ints[i - 1] + MIN_GAP)} or later).`
      }
    }
  }
  return null
}

export const countSlots = (av) =>
  DAY_KEYS.reduce((n, k) => n + (Array.isArray(av?.[k]) ? av[k].length : 0), 0)
