import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'
import { DAYS, emptyAvailability, normalizeTime } from '../utils/availability.js'

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

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

// Embed to-one bisa datang sebagai objek atau array: ambil elemen pertamanya.
const one = (value) => (Array.isArray(value) ? value[0] : value) ?? null

// PostgREST diam-diam membatasi 1.000 baris per respons: fetch bertahap dengan .range() blok 1.000.
const fetchAllRows = async (buildQuery) => {
  const pageSize = 1000
  const rows = []
  let from = 0
  for (;;) {
    const { data, error } = await buildQuery().range(from, from + pageSize - 1)
    if (error) throw dbError(error)
    rows.push(...(data ?? []))
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return rows
}

// Membangun kartu publik untuk N coach sekaligus (tanpa N+1).
// coachProfiles: baris coach_profiles (hanya kolom yang diizinkan, tanpa academy_label).
const loadCards = async (coachProfiles) => {
  if (!coachProfiles.length) return []
  const ids = coachProfiles.map((cp) => cp.id)

  const [{ data: profiles, error: profilesError }, { data: stats, error: statsError }, { data: availRows, error: availError }, vodRows, { data: ratingRows, error: ratingsError }] =
    await Promise.all([
      supabaseAdmin.from('profiles').select('id, name').in('id', ids),
      supabaseAdmin.from('coach_rating_stats').select('coach_id, rating_avg').in('coach_id', ids),
      supabaseAdmin.from('coach_availability').select('coach_id, day, start_time').in('coach_id', ids),
      // VOD per coach lewat filter embedded orders!inner, di-halaman karena bisa > 1.000 baris.
      fetchAllRows(() =>
        supabaseAdmin
          .from('sessions')
          .select('id, orders!inner(coach_id)')
          .in('orders.coach_id', ids)
          .not('vod_url', 'is', null),
      ),
      // Review + nama player langsung dari join ratings -> orders -> profiles.
      supabaseAdmin
        .from('ratings')
        .select('rating, review, rated_at, orders!inner(coach_id, player:profiles!orders_player_id_fkey(name))')
        .in('orders.coach_id', ids)
        .not('review', 'is', null),
    ])
  if (profilesError) throw dbError(profilesError)
  if (statsError) throw dbError(statsError)
  if (availError) throw dbError(availError)
  if (ratingsError) throw dbError(ratingsError)

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

  // vodsCoached = jumlah session coach ini (via join orders) yang vod_url-nya tidak null.
  const vodsByCoach = new Map(ids.map((id) => [id, 0]))
  for (const row of vodRows) {
    const coachId = one(row.orders)?.coach_id
    if (coachId != null && vodsByCoach.has(coachId)) vodsByCoach.set(coachId, vodsByCoach.get(coachId) + 1)
  }

  // Review untuk testimonial, nama player ikut dari join embedded (orders!inner -> profiles).
  const ratingsByCoach = new Map(ids.map((id) => [id, []]))
  for (const r of ratingRows ?? []) {
    const order = one(r.orders)
    if (!order) continue
    const review = typeof r.review === 'string' ? r.review.trim() : ''
    if (!review) continue
    const list = ratingsByCoach.get(order.coach_id)
    if (list) list.push({ rating: r.rating, review, ratedAt: r.rated_at, playerName: one(order.player)?.name ?? 'Player' })
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
    if (!isBookable(coach)) throw new AppError('Coach tidak ditemukan', 404)

    const [card] = await loadCards([coach])

    // Slot yang sudah terisi (checkout picker memfilter ini), 14 hari ke depan.
    // Session tidak punya coach_id, jadi join ke orders. Sessions order
    // pending_payment ikut dihitung supaya slot tidak bisa diambil dua kali
    // selama order pertama belum dibayar.
    const now = Date.now()
    const horizon = new Date(now + 14 * 864e5).toISOString()
    const { data: bookedRows, error: bookedError } = await supabaseAdmin
      .from('sessions')
      .select('scheduled_at, orders!inner(coach_id, status)')
      .eq('orders.coach_id', coach.id)
      .eq('status', 'scheduled')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', new Date(now).toISOString())
      .lt('scheduled_at', horizon)
    if (bookedError) throw dbError(bookedError)

    return c.json({ ...card, bookedStarts: (bookedRows ?? []).map((r) => r.scheduled_at).sort() }, 200)
  },
}
