// Small helpers shared by the dashboard blocks.
export const TZ = 'Asia/Jakarta'
export const at = (iso, opts) => (iso ? new Date(iso).toLocaleString('en-GB', { timeZone: TZ, ...opts }) : '')
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Calendar-day distance from today (coach timezone), for "in 4 days".
const dayDiff = (iso) => {
  const day = (x) => new Date(new Date(x).toLocaleDateString('en-CA', { timeZone: TZ })).getTime()
  return Math.round((day(iso) - day(new Date())) / 86400000)
}
export const relative = (iso) => {
  if (!iso) return ''
  const n = dayDiff(iso)
  return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n > 1 ? `in ${n} days` : n === -1 ? 'yesterday' : `${-n} days ago`
}

// Where an order is in the coach's workflow.
export const stageOf = (order, sessions = []) => {
  if (sessions.some((s) => s?.status !== 'completed')) return 'sessions' // still has sessions to run
  if (!order.performanceReview) return 'due' // all done, review not written yet
  return order.rating ? 'rated' : 'awaiting' // review sent: waiting for the player, or already rated
}

// Everything the Reputation panel and the hero show. `ratings` is the ONE list of all coach ratings (getCoachRatings():
// rating history + the rating on every rated order), shape { playerNickname, rating, comment, ratedAt }.
// counts[0] = 5 stars ... counts[4] = 1 star. The hero and the Reputation panel both use this result, so the number is always the same.
export const ratingStats = (ratings = []) => ({
  n: ratings.length,
  avg: ratings.length ? ratings.reduce((sum, r) => sum + (r?.rating ?? 0), 0) / ratings.length : 0,
  counts: [5, 4, 3, 2, 1].map((star) => ratings.filter((r) => r?.rating === star).length),
  latest: [...ratings].sort((a, b) => new Date(b?.ratedAt ?? 0) - new Date(a?.ratedAt ?? 0)), // newest first, by ratedAt
})

// Calendar helpers in the coach timezone. Dates are handled as "YYYY-MM-DD" strings / UTC midnights so the week and month cut-offs do not drift.
const ymd = (x) => new Date(x).toLocaleDateString('en-CA', { timeZone: TZ })
const utcDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)) }
const mondayOf = (s) => { const d = utcDay(s); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d }
const utcLabel = (d, opts) => d.toLocaleDateString('en-US', { timeZone: 'UTC', ...opts })

// Completed sessions per week (Monday to Sunday) for the last `n` weeks (this week included), by completedAt.
export const weeklyCompleted = (sessions = [], n = 6) => {
  const thisMonday = mondayOf(ymd(new Date()))
  return Array.from({ length: n }, (_, i) => {
    const start = new Date(thisMonday)
    start.setUTCDate(start.getUTCDate() - 7 * (n - 1 - i))
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 7)
    const count = sessions.filter((s) => {
      if (s?.status !== 'completed' || !s?.completedAt) return false
      const day = utcDay(ymd(s.completedAt))
      return day >= start && day < end
    }).length
    return { key: start.toISOString().slice(0, 10), label: utcLabel(start, { month: 'short', day: 'numeric' }), count }
  })
}
