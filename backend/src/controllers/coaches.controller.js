import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

// Helper users/availability tidak di-export (file itu tidak boleh diubah), jadi ditulis ulang di sini.
const emptyAvailability = () => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
})

// coach_availability.start_time bisa kembali sebagai 'HH:MM:SS' dari Postgres: ambil 'HH:MM'.
const normalizeTime = (value) => String(value ?? '').slice(0, 5)

const NO_TESTIMONIAL = { quote: 'No reviews yet.', reviewerInitials: '', reviewerName: '' }

// "Mars Hidayat" -> "Mars H.", "aslarant" -> "aslarant".
const displayName = (fullName) => {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Player'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

// "Mars H." -> "MH".
const initialsOf = (name) =>
  String(name ?? '')
    .split(/\s+/)
    .map((p) => (p.match(/[A-Za-z0-9]/) ?? [''])[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

// rating_avg numeric bisa datang sebagai string: bungkus Number(). Selalu integer 0-5.
const toRating = (avg) => {
  if (avg == null) return 0
  const n = Math.round(Number(avg))
  if (!Number.isFinite(n)) return 0
  return Math.min(5, Math.max(0, n))
}

// Membangun kartu publik untuk N coach sekaligus (tanpa N+1).
// coachProfiles: baris coach_profiles (hanya kolom yang diizinkan, tanpa academy_label).
const loadCards = async (coachProfiles) => {
  if (!coachProfiles.length) return []
  const ids = coachProfiles.map((cp) => cp.id)

  const [{ data: profiles, error: profilesError }, { data: stats, error: statsError }, { data: availRows, error: availError }, { data: orders, error: ordersError }] =
    await Promise.all([
      supabaseAdmin.from('profiles').select('id, name').in('id', ids),
      supabaseAdmin.from('coach_rating_stats').select('coach_id, rating_avg').in('coach_id', ids),
      supabaseAdmin.from('coach_availability').select('coach_id, day, start_time').in('coach_id', ids),
      supabaseAdmin.from('orders').select('id, coach_id, player_id').in('coach_id', ids),
    ])
  if (profilesError) throw dbError(profilesError)
  if (statsError) throw dbError(statsError)
  if (availError) throw dbError(availError)
  if (ordersError) throw dbError(ordersError)

  const orderIds = (orders ?? []).map((o) => o.id)
  const orderById = new Map((orders ?? []).map((o) => [o.id, o]))

  // vodsCoached = jumlah session coach ini (via orders.coach_id) yang vod_url-nya tidak null.
  // ratings + nama player untuk testimonial. Keduanya batched; dilewati bila coach belum punya order.
  let sessions = []
  let ratings = []
  if (orderIds.length) {
    const [{ data: sessionRows, error: sessionsError }, { data: ratingRows, error: ratingsError }] = await Promise.all([
      supabaseAdmin.from('sessions').select('order_id, vod_url').in('order_id', orderIds).not('vod_url', 'is', null),
      supabaseAdmin.from('ratings').select('order_id, rating, review, rated_at').in('order_id', orderIds),
    ])
    if (sessionsError) throw dbError(sessionsError)
    if (ratingsError) throw dbError(ratingsError)
    sessions = sessionRows ?? []
    ratings = ratingRows ?? []
  }

  const playerIds = [...new Set((orders ?? []).map((o) => o.player_id).filter(Boolean))]
  let playerNames = new Map()
  if (playerIds.length) {
    const { data: players, error: playersError } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .in('id', playerIds)
    if (playersError) throw dbError(playersError)
    playerNames = new Map((players ?? []).map((p) => [p.id, p.name]))
  }

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.name]))
  const avgByCoach = new Map((stats ?? []).map((s) => [s.coach_id, s.rating_avg]))

  const availabilityByCoach = new Map(ids.map((id) => [id, emptyAvailability()]))
  for (const row of availRows ?? []) {
    const bucket = availabilityByCoach.get(row.coach_id)
    if (bucket && DAYS.includes(row.day)) bucket[row.day].push(normalizeTime(row.start_time))
  }
  for (const bucket of availabilityByCoach.values()) {
    for (const day of DAYS) bucket[day].sort()
  }

  const vodsByCoach = new Map(ids.map((id) => [id, 0]))
  for (const s of sessions) {
    const order = orderById.get(s.order_id)
    if (!order || s.vod_url == null || s.vod_url === '') continue
    vodsByCoach.set(order.coach_id, (vodsByCoach.get(order.coach_id) ?? 0) + 1)
  }

  const ratingsByCoach = new Map(ids.map((id) => [id, []]))
  for (const r of ratings ?? []) {
    const order = orderById.get(r.order_id)
    if (!order) continue
    const review = typeof r.review === 'string' ? r.review.trim() : ''
    if (!review) continue
    const list = ratingsByCoach.get(order.coach_id)
    if (list) list.push({ rating: r.rating, review, ratedAt: r.rated_at, playerName: playerNames.get(order.player_id) ?? 'Player' })
  }
  const testimonialByCoach = new Map()
  for (const [coachId, list] of ratingsByCoach) {
    // Terbaru yang ada review-nya, dengan rating 5 diutamakan.
    list.sort(
      (a, b) =>
        Number(b.rating === 5) - Number(a.rating === 5) ||
        String(b.ratedAt ?? '').localeCompare(String(a.ratedAt ?? '')),
    )
    const top = list[0]
    testimonialByCoach.set(
      coachId,
      top
        ? { quote: top.review, reviewerName: displayName(top.playerName), reviewerInitials: '' }
        : NO_TESTIMONIAL,
    )
    if (top) {
      testimonialByCoach.get(coachId).reviewerInitials = initialsOf(testimonialByCoach.get(coachId).reviewerName)
    }
  }

  return coachProfiles.map((cp) => ({
    id: cp.id,
    name: nameById.get(cp.id) ?? 'Coach',
    avatar: cp.avatar_url ?? null,
    bio: cp.bio ?? '',
    peakRank: cp.peak_rank ?? '',
    mainHero: cp.main_hero ?? '',
    price: cp.price ?? null,
    lanes: cp.lanes ?? [],
    availability: availabilityByCoach.get(cp.id) ?? emptyAvailability(),
    rating: toRating(avgByCoach.get(cp.id)),
    vodsCoached: vodsByCoach.get(cp.id) ?? 0,
    testimonial: testimonialByCoach.get(cp.id) ?? NO_TESTIMONIAL,
  }))
}

// Hanya kolom yang diizinkan. Tidak pernah membaca academy_label / discord_username / email.
const COACH_SELECT = 'id, peak_rank, main_hero, price, bio, lanes, avatar_url'

const isBookable = (cp) => cp.price != null && Array.isArray(cp.lanes) && cp.lanes.length > 0

export const coachesController = {
  // GET /coaches (public). Hanya coach yang bisa dipesan (price tidak null dan lanes tidak kosong).
  // Filter opsional di atasnya: lane (satu / koma, ANY match) dan search (substring nama/mainHero).
  list: async (c) => {
    const { lane, search } = c.req.valid('query')

    const { data, error } = await supabaseAdmin.from('coach_profiles').select(COACH_SELECT)
    if (error) throw dbError(error)

    let cards = await loadCards((data ?? []).filter(isBookable))

    if (lane !== undefined && lane.trim() !== '') {
      const allowed = ['gold', 'exp', 'mid', 'jungle', 'roam']
      const wanted = lane
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part !== '')
      const invalid = wanted.filter((part) => !allowed.includes(part))
      if (invalid.length > 0) {
        throw new AppError(
          `Lane tidak valid: ${invalid.join(', ')}. Pilih salah satu dari gold, exp, mid, jungle, roam`,
          422,
        )
      }
      if (wanted.length > 0) {
        cards = cards.filter((card) => wanted.some((w) => (card.lanes ?? []).includes(w)))
      }
    }

    const q = (search ?? '').trim().toLowerCase()
    if (q !== '') {
      cards = cards.filter(
        (card) =>
          String(card.name ?? '')
            .toLowerCase()
            .includes(q) ||
          String(card.mainHero ?? '')
            .toLowerCase()
            .includes(q),
      )
    }

    return c.json(cards, 200)
  },

  // GET /coaches/:id (public).
  getById: async (c) => {
    const { id } = c.req.valid('param')

    const { data: coach, error } = await supabaseAdmin
      .from('coach_profiles')
      .select(COACH_SELECT)
      .eq('id', id)
      .maybeSingle()
    if (error) throw dbError(error)
    if (!coach) throw new AppError('Coach tidak ditemukan', 404)

    const [card] = await loadCards([coach])
    return c.json(card, 200)
  },
}
