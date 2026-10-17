import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const TAX_RATE = 0.11
const SESSIONS_PER_ORDER = 3

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })


const COACH = 'coach:coach_profiles!orders_coach_id_fkey(id, avatar_url, discord_username, profile:profiles!coach_profiles_id_fkey(name))'
const PLAYER = 'player:profiles!orders_player_id_fkey(name)'
const REVIEW = 'performance_review:performance_reviews(notes, strengths, weaknesses, recommendation)'
const RATING = 'rating:ratings(rating, review, rated_at)'

const PLAYER_LIST_SELECT = `id, lane, status, session_count, ${COACH}, ${REVIEW}, ${RATING}`
const COACH_LIST_SELECT = `id, coach_id, lane, status, session_count, ${PLAYER}, ${REVIEW}, ${RATING}`
const DETAIL_SELECT =
  'id, lane, status, package_type, session_count, subtotal, tax, discount, total_price, currency, created_at, ' +
  `${COACH}, sessions(id, session_number, scheduled_at, scheduled_end, status, meeting_link), ${REVIEW}, ${RATING}`

// ---------- Formatters: ----------

const one = (value) => (Array.isArray(value) ? value[0] : value) ?? null

const formatReview = (r) =>
  r && { notes: r.notes, strengths: r.strengths, weaknesses: r.weaknesses, recommendation: r.recommendation }

const formatRating = (r) => r && { rating: r.rating, review: r.review, ratedAt: r.rated_at }

const formatCoach = (c) => ({ id: c.id, name: c.profile.name, avatar: c.avatar_url })

const formatSession = (s, total) => ({
  id: s.id,
  sessionNumber: s.session_number,
  totalSessions: total,
  scheduledAt: s.scheduled_at,
  scheduledEnd: s.scheduled_end,
  status: s.status,
  meetingLink: s.meeting_link,
})

const formatPlayerListItem = (o) => ({
  id: o.id,
  coach: formatCoach(o.coach),
  lane: o.lane,
  status: o.status,
  totalSessions: o.session_count,
  performanceReview: formatReview(one(o.performance_review)),
  rating: formatRating(one(o.rating)),
})

const formatCoachListItem = (o) => ({
  id: o.id,
  coachId: o.coach_id,
  player: { name: o.player.name },
  lane: o.lane,
  status: o.status,
  totalSessions: o.session_count,
  performanceReview: formatReview(one(o.performance_review)),
  rating: formatRating(one(o.rating)),
})

// The frontend reads both sessionCount (orders.js docs) and totalSessions (PlayerOrder.jsx), so both are sent.
const formatDetail = (o) => ({
  id: o.id,
  status: o.status,
  coach: { ...formatCoach(o.coach), discordUsername: o.coach.discord_username },
  lane: o.lane,
  packageType: o.package_type,
  sessionCount: o.session_count,
  totalSessions: o.session_count,
  subtotal: o.subtotal,
  tax: o.tax,
  discount: o.discount,
  totalPrice: o.total_price,
  currency: o.currency,
  createdAt: o.created_at,
  sessions: [...o.sessions]
    .sort((a, b) => a.session_number - b.session_number)
    .map((s) => formatSession(s, o.session_count)),
  performanceReview: formatReview(one(o.performance_review)),
  rating: formatRating(one(o.rating)),
})

// Looks the order up by id AND owner in one query. Someone else's order is simply "not found",
// so a player can't find out which order ids exist.
const findPlayerOrder = async (orderId, playerId) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(DETAIL_SELECT)
    .eq('id', orderId)
    .eq('player_id', playerId)
    .maybeSingle()
  if (error) throw dbError(error)
  return data
}

export const orderController = {
  // POST /orders (player only)
  create: async (c) => {
    const user = c.get('user')
    const { coachId, lane, billing, schedules } = c.req.valid('json')

    const { data: coach, error: coachError } = await supabaseAdmin
      .from('coach_profiles')
      .select('id, price, lanes')
      .eq('id', coachId)
      .maybeSingle()
    if (coachError) throw dbError(coachError)
    if (!coach) throw new AppError('Coach tidak ditemukan', 404)
    if (!coach.lanes.includes(lane)) throw new AppError('Coach tidak melayani lane ini', 400)
    // A newly registered coach has an empty profile, so price can still be null.
    if (coach.price == null) throw new AppError('Coach belum menetapkan harga', 400)

    // Player picks 3 distinct future session starts at checkout. 1 hour/session.
    const picked = [...new Set(schedules)].sort()
    if (picked.length !== SESSIONS_PER_ORDER) throw new AppError('Pilih 3 waktu sesi yang berbeda', 400)
    const starts = picked.map((s) => new Date(s).getTime())
    if (starts.some((t) => !Number.isFinite(t))) throw new AppError('Format jadwal tidak valid', 400)
    if (starts.some((t) => t <= Date.now())) throw new AppError('Jadwal harus di masa depan', 400)

    // Price always comes from the database, never from the request body.
    const subtotal = coach.price
    const tax = Math.round(subtotal * TAX_RATE)

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        player_id: user.id,
        coach_id: coachId,
        lane,
        subtotal,
        tax,
        discount: 0,
        total_price: subtotal + tax,
        billing_first_name: billing.firstName,
        billing_last_name: billing.lastName,
        billing_email: billing.email,
        billing_zip: billing.zip ?? null,
        billing_state: billing.state ?? null,
        billing_country: billing.country ?? null,
      })
      .select('id')
      .single()
    if (orderError) throw dbError(orderError)

    // Sessions are born scheduled (dates from checkout) but WITHOUT
    // meeting_link/google_event_id: the Meet link is created in the app
    // layer once the payment is paid. status uses the column default.
    const sessionRows = picked.map((scheduledAt, i) => ({
      order_id: order.id,
      session_number: i + 1,
      scheduled_at: scheduledAt,
      scheduled_end: new Date(starts[i] + 3600e3).toISOString(),
    }))
    const { error: sessionError } = await supabaseAdmin.from('sessions').insert(sessionRows)
    if (sessionError) {
      // Supabase has no transactions: undo the order so we never keep one without sessions.
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      throw dbError(sessionError)
    }

    const created = await findPlayerOrder(order.id, user.id)
    return c.json(formatDetail(created), 201)
  },

  // GET /orders (player or coach). The role in the token decides which orders and which JSON shape.
  list: async (c) => {
    const user = c.get('user')
    const isCoach = user.role === 'coach'

    let query = supabaseAdmin
      .from('orders')
      .select(isCoach ? COACH_LIST_SELECT : PLAYER_LIST_SELECT)
      .order('created_at', { ascending: false })

    // Coaches never see unpaid orders; players see all of theirs (the dashboard counts unpaid ones).
    query = isCoach
      ? query.eq('coach_id', user.id).neq('status', 'pending_payment')
      : query.eq('player_id', user.id)

    const { data, error } = await query
    if (error) throw dbError(error)

    return c.json(data.map(isCoach ? formatCoachListItem : formatPlayerListItem), 200)
  },

  // GET /orders/:id (player only)
  getById: async (c) => {
    const user = c.get('user')
    const { id } = c.req.valid('param')

    const order = await findPlayerOrder(id, user.id)
    if (!order) throw new AppError('Order tidak ditemukan', 404)

    return c.json(formatDetail(order), 200)
  },
}
