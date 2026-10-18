// Shared availability helpers for the 7-day coach week (all days 'HH:MM' slots).

// ===== 1. CONSTANTS =====

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// ===== 2. HELPERS =====

// Fresh week: all 7 day keys present with empty slot arrays.
export const emptyAvailability = () => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
})

// coach_availability.start_time can come back as 'HH:MM:SS' from Postgres: keep 'HH:MM'.
export const normalizeTime = (value) => String(value ?? '').slice(0, 5)

// Rows -> { monday: ['09:00', ...] } with all 7 day keys and times sorted per day.
export const buildAvailability = (rows) => {
  const availability = emptyAvailability()
  for (const row of rows ?? []) {
    if (!DAYS.includes(row.day)) continue
    availability[row.day].push(normalizeTime(row.start_time))
  }
  for (const day of DAYS) availability[day].sort()
  return availability
}
