// Small helpers shared by the dashboard blocks.
export const TZ = 'Asia/Jakarta'
export const at = (iso, opts) => new Date(iso).toLocaleString('en-GB', { timeZone: TZ, ...opts })
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Calendar-day distance from today (coach timezone), for "in 4 days".
const dayDiff = (iso) => {
  const day = (x) => new Date(new Date(x).toLocaleDateString('en-CA', { timeZone: TZ })).getTime()
  return Math.round((day(iso) - day(new Date())) / 86400000)
}
export const relative = (iso) => {
  const n = dayDiff(iso)
  return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n > 1 ? `in ${n} days` : n === -1 ? 'yesterday' : `${-n} days ago`
}

// Where an order is in the coach's workflow.
export const stageOf = (order, sessions) => {
  if (sessions.some((s) => s.status !== 'completed')) return 'sessions' // still has sessions to run
  if (!order.performanceReview) return 'due' // all done, review not written yet
  return order.rating ? 'rated' : 'awaiting' // review sent: waiting for the player, or already rated
}

// Everything the Reputation panel and the hero show. `ratings` is the ONE list of all coach ratings (getCoachRatings():
// rating history + the rating on every rated order), shape { playerNickname, rating, comment, ratedAt }.
// counts[0] = 5 stars ... counts[4] = 1 star. The hero and the Reputation panel both use this result, so the number is always the same.
export const ratingStats = (ratings) => ({
  n: ratings.length,
  avg: ratings.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0,
  counts: [5, 4, 3, 2, 1].map((star) => ratings.filter((r) => r.rating === star).length),
  latest: [...ratings].sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt)), // newest first, by ratedAt
})

// Calendar helpers in the coach timezone. Dates are handled as "YYYY-MM-DD" strings / UTC midnights so the week and month cut-offs do not drift.
const ymd = (x) => new Date(x).toLocaleDateString('en-CA', { timeZone: TZ })
const utcDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)) }
const mondayOf = (s) => { const d = utcDay(s); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d }
const utcLabel = (d, opts) => d.toLocaleDateString('en-US', { timeZone: 'UTC', ...opts })

// Average rating per month for the last `n` months (this month included), by ratedAt. avg = null when a month has no ratings.
export const monthlyRatings = (ratings, n = 6) => {
  const [y, m] = ymd(new Date()).split('-').map(Number)
  return Array.from({ length: n }, (_, i) => {
    const first = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1))
    const key = first.toISOString().slice(0, 7)
    const scores = ratings.filter((r) => r.ratedAt && ymd(r.ratedAt).slice(0, 7) === key).map((r) => r.rating)
    return { key, label: utcLabel(first, { month: 'short' }), n: scores.length, avg: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null }
  })
}

// Completed sessions per week (Monday to Sunday) for the last `n` weeks (this week included), by completedAt.
export const weeklyCompleted = (sessions, n = 6) => {
  const thisMonday = mondayOf(ymd(new Date()))
  return Array.from({ length: n }, (_, i) => {
    const start = new Date(thisMonday)
    start.setUTCDate(start.getUTCDate() - 7 * (n - 1 - i))
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 7)
    const count = sessions.filter((s) => {
      if (s.status !== 'completed' || !s.completedAt) return false
      const day = utcDay(ymd(s.completedAt))
      return day >= start && day < end
    }).length
    return { key: start.toISOString().slice(0, 10), label: utcLabel(start, { month: 'short', day: 'numeric' }), count }
  })
}

// The coach's own lanes (from the profile, max 3) with their player count, most players first.
// A lane the coach does not have is never shown, even if an old order used it.
export const laneCounts = (orders, lanes, max = 3) =>
  lanes.slice(0, max).map((lane) => ({ lane, count: orders.filter((o) => o.lane === lane).length })).sort((a, b) => b.count - a.count)
