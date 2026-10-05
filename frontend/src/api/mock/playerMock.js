// MOCK for the player dashboard. DELETE with src/api/mock/ when the real API is live.
// Merges two demo orders (for testing the rating flow) with real orders created through checkout.
import { listOrders } from './ordersMock'
import { getStoredUser } from '../../utils/session'

const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 250))
const coach = (id, name) => ({ id, name, avatar: null })
const vod = (n) => ({ url: 'https://www.youtube.com/', downloadUrl: `https://example.com/vod-${n}.mp4` })
const endOf = (at) => (at ? new Date(new Date(at).getTime() + 3600e3).toISOString() : null)
const s = (id, orderId, n, at, status, c, hasVod) => ({ id, orderId, coach: c, sessionNumber: n, totalSessions: 3, scheduledAt: at, scheduledEnd: endOf(at), meetingLink: status === 'scheduled' ? 'https://meet.google.com/abc-defg-hij' : null, status, vod: hasVod ? vod(id) : null })

const faros = coach(1, 'Coach Faros'), seemon = coach(2, 'Coach Seemon')
let demoOrders = [
  { id: 'ord-001', coach: faros, lane: 'mid', status: 'in_progress', totalSessions: 3, performanceReview: null, rating: null },
  { id: 'ord-002', coach: seemon, lane: 'gold', status: 'awaiting_rating', totalSessions: 3, rating: null,
    performanceReview: { notes: 'Strong laning, but rotations after first turret are late.', strengths: ['Farm efficiency', 'Hero mastery'], weaknesses: ['Map awareness'], recommendation: 'Drill rotation timings in ranked.' } },
]
const demoSessions = [
  s('s1', 'ord-001', 1, '2026-09-28T20:00:00+07:00', 'completed', faros, true),
  s('s2', 'ord-001', 2, '2026-10-03T20:00:00+07:00', 'scheduled', faros, false),
  s('s3', 'ord-001', 3, '2026-10-06T20:00:00+07:00', 'scheduled', faros, false),
  s('s4', 'ord-002', 1, '2026-09-18T19:00:00+07:00', 'completed', seemon, true),
  s('s5', 'ord-002', 2, '2026-09-22T19:00:00+07:00', 'completed', seemon, true),
  s('s6', 'ord-002', 3, '2026-09-26T19:00:00+07:00', 'completed', seemon, true),
]
const materials = [
  { id: 'm1', type: 'fundamental', title: 'Rotation 101 - What to do as a roamer when your team is losing?', tagline: 'Roam fundamentals', description: '', thumbnailUrl: null, link: 'https://www.youtube.com/' },
  { id: 'm2', type: 'guide', title: 'Novaria', tagline: 'The Sharpshooter', description: 'Terrify your enemies with your constant poke and leave them vulnerable before big fights.', thumbnailUrl: null, link: 'https://www.youtube.com/' },
]

const real = listOrders
const allOrders = () => [...demoOrders, ...real().map((o) => ({ id: o.id, coach: o.coach, lane: o.lane, status: o.status, totalSessions: o.sessionCount, performanceReview: null, rating: null }))]
const allSessions = () => [...demoSessions, ...real().flatMap((o) => o.sessions.map((x) => ({ ...x, orderId: o.id, coach: o.coach, vod: null })))]

export const mock = {
  getSessions: () => wait(allSessions()),
  getOrders: () => wait(allOrders()),
  getOrder: (id) => wait({ ...allOrders().find((o) => o.id === id), sessions: allSessions().filter((x) => x.orderId === id) }),
  completeSession: (id) => {
    const notEnded = (x) => !x.scheduledEnd || new Date(x.scheduledEnd).getTime() > Date.now()
    const demo = demoSessions.find((x) => x.id === id)
    if (demo) {
      if (demo.status === 'completed') throw new Error('Session already completed')
      if (notEnded(demo)) throw new Error('Session has not ended yet')
      demo.status = 'completed'
      demo.completedAt = new Date().toISOString()
      return wait(demo)
    }
    const KEY = 'metagames_mock_db'
    const db = JSON.parse(localStorage.getItem(KEY) || '{"orders":{},"payments":{}}')
    for (const o of Object.values(db.orders)) {
      const ses = o.sessions.find((x) => x.id === id)
      if (ses) {
        if (ses.status === 'completed') throw new Error('Session already completed')
        if (notEnded(ses)) throw new Error('Session has not ended yet')
        ses.status = 'completed'
        ses.completedAt = new Date().toISOString()
        localStorage.setItem(KEY, JSON.stringify(db))
        return wait({ ...ses, orderId: o.id, coach: o.coach, vod: null })
      }
    }
    throw new Error('Session not found')
  },
  getMaterials: () => wait(materials),
  getMe: () => { const u = getStoredUser(); return wait({ name: u?.name ?? 'Player', email: u?.email ?? '', avatarUrl: null, bio: '', timezone: 'Asia/Jakarta' }) },
  getConfig: () => wait({ discordInviteUrl: 'https://discord.gg/' }),
  postRating: (id, body) => { demoOrders = demoOrders.map((o) => (o.id === id ? { ...o, rating: body, status: 'completed' } : o)); return wait({ ok: true }) },
  changePassword: () => wait({ ok: true }),
}
