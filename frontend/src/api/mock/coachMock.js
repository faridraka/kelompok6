// MOCK for the coach dashboard. DELETE with src/api/mock/ when the real API is live.
// Data lives in memory (resets on refresh), so a reload always loads the seed below. Session/order shapes match
// playerMock.js so the real API can serve both sides with the same JSON.
// Every date is RELATIVE to now (Jakarta time), so the countdown, the week board and the charts stay alive whenever it is opened.
import { LANES, generateCoaches } from '../../data/coaches'
import { readDraft } from '../../utils/material'
import { getCoachId } from '../../utils/session'
import { isHttpUrl } from '../../utils/youtube'

// Seed version. This mock keeps everything in memory, so a reload always loads the current seed. Leftover localStorage keys from an
// older coach mock (metagames_coach_mock*) are removed here, so old browser data can never mix with this seed or throw.
const SEED_VERSION = 2
try { Object.keys(localStorage).filter((k) => k.startsWith('metagames_coach_mock') && k !== `metagames_coach_mock_v${SEED_VERSION}`).forEach((k) => localStorage.removeItem(k)) } catch { /* storage blocked: nothing to clean */ }

const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 250))
// Coach Faros (id 1, lanes from data/coaches.js: gold, mid) and Coach Seemon (id 2, lanes set here: jungle, gold, exp).
// These two objects are the editable profiles: saveProfile changes them, and every page reads them through getProfile.
const COACHES = generateCoaches(9).slice(0, 2).map((c) => (c.id === 2 ? { ...c, lanes: ['jungle', 'gold', 'exp'] } : c))

// The mock seed only has coaches 1 and 2, but a real backend login returns a UUID.
// Without this, a backend coach id matches nothing and every coach page renders empty.
const coachId = () => {
  const id = getCoachId()
  return COACHES.some((c) => c.id === id) ? id : 2
}

const me = () => COACHES.find((c) => c.id === coachId()) ?? COACHES[0]

// daysFromNow(-4, '19:00') = four days ago at 19:00 Jakarta time, as an ISO string with +07:00.
const daysFromNow = (days, time = '19:00') => `${new Date(Date.now() + days * 864e5).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })}T${time}:00+07:00`

const vod = (id) => ({ url: 'https://www.youtube.com/', downloadUrl: `https://example.com/vod-${id}.mp4` })
// A completed session also carries completedAt (= its scheduled time). Recording only counts when hasVod is true.
const addHour = (time) => {
  const [h, m] = time.split(':').map(Number)
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
const s = (id, orderId, n, days, time, status, meetingLink = null, hasVod = false) => {
  const at = daysFromNow(days, time)
  const end = daysFromNow(days, addHour(time))
  return { id, orderId, sessionNumber: n, totalSessions: 3, scheduledAt: at, scheduledEnd: end, status, meetingLink, vod: hasVod ? vod(id) : null, ...(status === 'completed' && { completedAt: at }) }
}
// A freshly paid order: no dates yet, the coach schedules them (backend creates the Meet link).
const su = (id, orderId, n) =>
  ({ id, orderId, sessionNumber: n, totalSessions: 3, scheduledAt: null, scheduledEnd: null, status: 'scheduled', meetingLink: null, vod: null })
const finished = (key, orderId, days, time = '19:00', vods = [true, true, true]) =>
  days.map((day, i) => s(`s${key}-${i + 1}`, orderId, i + 1, day, time, 'completed', null, vods[i]))
// Order status: scheduled -> in_progress -> awaiting_rating (review sent) -> completed (player rated, review locked).
const order = (id, coachId, name, lane, status, rating = null, performanceReview = null) =>
  ({ id, coachId, player: { name }, lane, status, totalSessions: 3, performanceReview, rating })
const review = (notes, strengths, weaknesses, recommendation) => ({ notes, strengths, weaknesses, recommendation })
const rated = (score, text, daysAgo) => ({ rating: score, review: text, ratedAt: daysFromNow(daysAgo, '12:00') })
const past = (playerNickname, rating, comment, days) => ({ playerNickname, rating, comment, ratedAt: daysFromNow(days, '12:00') })
const LINK = 'https://meet.google.com/new'

const orders = [
  // Coach Seemon (lanes: jungle, gold, exp): 2 in sessions, 1 review due, 1 awaiting rating, 1 rated.
  order('ORD-101', 2, 'aslarant', 'exp', 'completed', rated(5, 'Rotasinya jadi jauh lebih rapi, makasih coach.', -20),
    review('Baca draft sudah bagus dan rotasi tepat waktu. Manajemen cooldown skill masih turun saat team fight panjang.', ['Baca draft', 'Rotasi tepat waktu'], ['Manajemen cooldown skill'], 'Hitung ultimate lawan sebelum memutuskan untuk engage.')),
  order('ORD-102', 2, 'kinakina', 'gold', 'awaiting_rating', null,
    review('Laning kuat dan damage output stabil. Rotasi setelah turret pertama masih telat dan posisi saat team fight perlu dirapikan.', ['Laning kuat', 'Damage output stabil'], ['Timing rotasi setelah turret pertama', 'Positioning di team fight'], 'Catat tiap rotasi yang telat di ranked, lalu review bareng di sesi berikutnya.')),
  order('ORD-103', 2, 'karltzy', 'jungle', 'in_progress'),
  order('ORD-104', 2, 'Henshin', 'jungle', 'in_progress'),
  order('ORD-105', 2, 'robbyganteng', 'exp', 'scheduled'),
  order('ORD-106', 2, 'bagas_', 'gold', 'scheduled'), // freshly paid: waiting for schedule
  // Coach Faros (lanes from data/coaches.js: gold, mid): 1 in sessions, 1 review due, 1 rated.
  order('ORD-201', 1, 'dimzz', 'mid', 'completed', rated(5, 'Trading di lane jadi lebih berani dan terukur, thanks coach.', -12),
    review('Trading di lane sudah bagus dan timing fight tepat. Masih sering overextend saat jungler lawan tidak terlihat.', ['Trading di lane', 'Timing fight'], ['Overextend tanpa vision'], 'Pasang ward di river sebelum push dan pantau posisi jungler lawan.')),
  order('ORD-202', 1, 'salsaplay', 'gold', 'in_progress'),
  order('ORD-203', 1, 'gilangmid', 'mid', 'in_progress'),
]
const sessions = [
  // Seemon
  ...finished('101', 'ORD-101', [-40, -33, -26]),
  ...finished('102', 'ORD-102', [-30, -23, -16]),
  ...finished('103', 'ORD-103', [-18, -11, -5], '19:00', [true, true, false]), // session 3 has no recording yet, review not written
  s('s104-1', 'ORD-104', 1, -4, '19:00', 'completed'), // no recording
  s('s104-2', 'ORD-104', 2, 3, '19:00', 'scheduled', LINK),
  s('s104-3', 'ORD-104', 3, 6, '16:00', 'scheduled'),
  s('s105-1', 'ORD-105', 1, 1, '18:00', 'scheduled'), // the NEXT session on the dashboard
  s('s105-2', 'ORD-105', 2, 5, '19:00', 'scheduled'),
  s('s105-3', 'ORD-105', 3, 12, '19:00', 'scheduled'),
  su('s106-1', 'ORD-106', 1),
  su('s106-2', 'ORD-106', 2),
  su('s106-3', 'ORD-106', 3),
  // Faros
  ...finished('201', 'ORD-201', [-34, -27, -20]),
  ...finished('202', 'ORD-202', [-12, -8, -3], '20:00'), // review due
  s('s203-1', 'ORD-203', 1, -2, '19:00', 'completed', null, true),
  s('s203-2', 'ORD-203', 2, 1, '20:00', 'scheduled', LINK),
  s('s203-3', 'ORD-203', 3, 4, '19:00', 'scheduled'),
]
// Materials (the MATERIALS table shape) on two completed sessions of Seemon: one guide, one fundamental.
const YT = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'
const attachMaterial = (sessionId, days, m) => {
  Object.assign(sessions.find((x) => x.id === sessionId), { material: { id: `mat-${sessionId}`, thumbnailUrl: 'https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg', link: YT, createdAt: daysFromNow(days, '21:00'), ...m } })
}

// Ratings from players who are no longer in the order list, spread from about -175 to -35 days, scores climbing over time.
// The Rating trend only draws the last 6 calendar months, so the oldest one or two count in the average but not in the chart.
// ALL coach ratings come from this list plus the rating on each rated order (see ratings() below). Nothing is hard-coded.
const ratingHistory = {
  2: [
    past('mooncake', 3, 'Penjelasannya jelas, tapi aku masih butuh waktu buat nerapin.', -175),
    past('zhuxin_', 4, 'Review VOD-nya detail, jadi tahu salah di mana.', -150),
    past('Nexxa', 4, 'Jungle pathing-ku jauh lebih efisien sekarang.', -128),
    past('bluebird', 4, 'Sesinya padat dan langsung ke inti masalah.', -110),
    past('Tamago', 5, 'Baru paham kenapa sering telat objektif, mantap coach.', -92),
    past('rexxy', 5, 'Rekomendasinya gampang diikuti tiap match.', -76),
    past('lunaaa', 5, 'Draft dan rotasi jadi lebih tertata, rank langsung naik.', -60),
    past('Kyuubi', 5, 'Sabar banget ngajarinnya, recommended.', -46),
    past('daffa99', 5, 'Coach-nya ngerti banget gaya main aku, makasih.', -35),
  ],
  1: [
    past('arlan_ml', 4, 'Materi mid lane-nya rapi dan gampang dipraktikkan.', -140),
    past('vinzz', 4, 'Timing rotasi mid jadi jauh lebih baik.', -118),
    past('Raihan', 5, 'Breakdown VOD-nya enak dipahami, ranked jadi lebih stabil.', -96),
    past('cherrybomb', 4, 'Sesinya berguna, jadwal sempat bergeser sekali.', -75),
    past('Bimo', 5, 'Cara jelasinnya sabar dan spesifik.', -55),
    past('naufal_', 5, 'Banyak insight baru soal baca draft lawan.', -40),
  ],
}
const wallets = { 1: { available: 450000, pending: 300000 }, 2: { available: 800000, pending: 400000 } }

const myOrders = () => orders.filter((o) => o.coachId === coachId())
const mySessions = () => { const ids = myOrders().map((o) => o.id); return sessions.filter((x) => ids.includes(x.orderId)) }

// One source for every rating number: the history above plus the rating on each rated order. Newest first.
const ratings = () => [
  ...(ratingHistory[coachId()] ?? []),
  ...myOrders().filter((o) => o.rating).map((o) => ({ playerNickname: o.player.name, rating: o.rating.rating, comment: o.rating.review, ratedAt: o.rating.ratedAt, orderId: o.id })),
].sort((a, b) => b.ratedAt.localeCompare(a.ratedAt))

// Edits mutate the same arrays the dashboard reads, so every page stays in sync (until refresh).
const mine = (id) => {
  const s = mySessions().find((x) => x.id === id)
  if (!s) throw new Error('Session not found')
  return s
}

// A finished order can be reviewed. The review stays editable until the player rates (status "completed").
const saveReview = (orderId, { notes, strengths, weaknesses, recommendation }) => {
  const o = myOrders().find((x) => x.id === orderId)
  if (!o) throw new Error('Order not found')
  if (o.status === 'completed') throw new Error('Locked, player has already rated')
  if (!mySessions().filter((x) => x.orderId === orderId).every((x) => x.status === 'completed')) throw new Error('Finish all sessions first')
  o.performanceReview = { notes, strengths, weaknesses, recommendation } // strengths/weaknesses are arrays
  o.status = 'awaiting_rating'
  return wait(o)
}

// VOD-1 stub: simulates object storage (R2). Validates video files and returns a fake public URL.
const uploadVod = (file) => {
  if (!file) throw new Error('Pick a video file.')
  const ok = file.type.startsWith('video/') || /\.(mp4|mkv|webm|mov|m4v|avi|ogv)$/i.test(file.name)
  if (!ok) throw new Error('Only video files are allowed (mp4, mkv, webm, mov).')
  const key = `vods/${crypto.randomUUID()}/${file.name.replace(/\s+/g, '_')}`
  return wait({ url: `https://r2.mock/${key}`, fileName: file.name, size: file.size })
}

// Saves the VOD on the session itself, in the shape PlayerVods reads: { url, downloadUrl }.
// material: an object = add or replace the session's material, null = remove it, undefined = leave it alone.
// An existing material keeps its id and createdAt when it is edited. Nothing is uploaded: only links are kept.
const saveRecording = (sessionId, { url, material }) => {
  const s = mine(sessionId)
  if (s.status !== 'completed') throw new Error('Finish the session first')
  if (!isHttpUrl(url)) throw new Error('Link must start with http:// or https://')
  const checked = material ? readDraft(material) : { material: null }
  if (checked.error) throw new Error(checked.error)
  s.vod = { url, downloadUrl: url }
  if (material !== undefined) {
    if (!checked.material) delete s.material // null, or a block with nothing in it
    else {
      const { type, title, tagline, description, thumbnailUrl, link } = checked.material
      s.material = { id: s.material?.id ?? crypto.randomUUID(), type, title, tagline, description, thumbnailUrl, link, createdAt: s.material?.createdAt ?? new Date().toISOString() }
    }
  }
  return wait(s)
}

// Saves the profile fields the coach may edit (the photo, rating and id are not editable). Same rules as the form.
const saveProfile = ({ name, academyLabel, peakRank, mainHero, price, bio, lanes }) => {
  if (!String(name ?? '').trim()) throw new Error('Enter a display name.')
  if (!Number.isFinite(price) || price < 0) throw new Error('Enter a price (0 or more).')
  if (String(bio ?? '').length > 300) throw new Error('Bio must be 300 characters or less.')
  if (!lanes?.length || lanes.length > 3 || lanes.some((l) => !LANES.some((x) => x.key === l))) throw new Error('Pick 1 to 3 lanes.')
  return wait(Object.assign(me(), { name: name.trim(), academyLabel, peakRank, mainHero, price, bio, lanes: [...lanes] }))
}

export const mock = {
  getProfile: () => wait(me()),
  saveProfile,
  getOrders: () => wait(myOrders()),
  getSessions: () => wait(mySessions()),
  getWallet: () => wait(wallets[coachId()]),
  getRatings: () => wait(ratings()),
  saveReview,
  saveRecording,
  uploadVod,
  updateSession: (id, { scheduledAt, scheduledEnd, meetingLink }) => {
    const s = mine(id)
    if (s.status === 'completed') throw new Error('Completed sessions cannot be edited')
    Object.assign(s, { scheduledAt, scheduledEnd: scheduledEnd ?? s.scheduledEnd ?? null, meetingLink })
    return wait(s)
  },
  // SESS-3 stub: the real backend creates the Google Calendar event + Meet link.
  // Mock simulates it with a placeholder link so the player join flow stays testable.
  createSchedule: (id, { scheduledAt, scheduledEnd }) => {
    const s = mine(id)
    if (s.status === 'completed') throw new Error('Completed sessions cannot be edited')
    if (s.scheduledAt) throw new Error('Session already scheduled')
    if (!scheduledAt || !scheduledEnd) throw new Error('Pick a start time.')
    Object.assign(s, { scheduledAt, scheduledEnd, meetingLink: `https://meet.google.com/mock-${String(s.id).toLowerCase()}` })
    return wait(s)
  },
  completeSession: (id) => {
    const s = mine(id)
    if (!s.scheduledAt) throw new Error('Schedule the session first')
    if (!s.scheduledEnd || new Date(s.scheduledEnd).getTime() > Date.now()) throw new Error('Session has not ended yet')
    s.status = 'completed'
    s.completedAt = new Date().toISOString()
    const o = orders.find((x) => x.id === s.orderId)
    if (o.status === 'scheduled') o.status = 'in_progress' // first finished session starts the coaching
    return wait(s)
  },
}