import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

const emptyAvailability = () => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
})

// coach_availability.start_time can come back as 'HH:MM:SS' from Postgres: keep 'HH:MM'.
const normalizeTime = (value) => String(value ?? '').slice(0, 5)

const buildAvailability = (rows) => {
  const availability = emptyAvailability()
  for (const row of rows ?? []) {
    if (!DAYS.includes(row.day)) continue
    availability[row.day].push(normalizeTime(row.start_time))
  }
  for (const day of DAYS) availability[day].sort()
  return availability
}

const formatPlayer = (user, profile) => ({
  id: user.id,
  role: 'player',
  name: profile.name,
  email: user.email,
  avatarUrl: null,
  bio: '',
  timezone: 'Asia/Jakarta',
})

const formatCoach = (user, profile, coachProfile, availability) => ({
  id: user.id,
  role: 'coach',
  name: profile.name,
  email: user.email,
  avatar: coachProfile.avatar_url ?? null,
  peakRank: coachProfile.peak_rank ?? null,
  mainHero: coachProfile.main_hero ?? null,
  price: coachProfile.price ?? null,
  bio: coachProfile.bio ?? null,
  lanes: coachProfile.lanes ?? [],
  availability,
})

// Reads everything GET and PUT need. Never selects academy_label.
const loadMe = async (user) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) throw dbError(profileError)
  if (!profile) throw new AppError('Profil tidak ditemukan', 404)

  const role = user.role ?? profile.role
  if (role !== 'coach' && role !== 'player') throw new AppError('Role tidak dikenal', 403)

  if (role === 'player') return formatPlayer(user, profile)

  const { data: coachProfile, error: coachError } = await supabaseAdmin
    .from('coach_profiles')
    .select('peak_rank, main_hero, price, bio, lanes, avatar_url')
    .eq('id', user.id)
    .maybeSingle()
  if (coachError) throw dbError(coachError)
  if (!coachProfile) throw new AppError('Profil coach tidak ditemukan', 404)

  const { data: availabilityRows, error: availabilityError } = await supabaseAdmin
    .from('coach_availability')
    .select('day, start_time')
    .eq('coach_id', user.id)
  if (availabilityError) throw dbError(availabilityError)

  return formatCoach(user, profile, coachProfile, buildAvailability(availabilityRows))
}

export const usersController = {
  // GET /users/me (player or coach). Shape follows the token role.
  getMe: async (c) => {
    const user = c.get('user')
    return c.json(await loadMe(user), 200)
  },

  // PUT /users/me (player or coach). Returns the same shape as GET.
  updateMe: async (c) => {
    const user = c.get('user')
    const body = c.req.valid('json')

    // Shape follows the token role, not the body shape.
    const role = user.role
    if (role !== 'coach' && role !== 'player') throw new AppError('Role tidak dikenal', 403)

    if (role === 'player') {
      if (typeof body.name !== 'string') throw new AppError('Nama tidak valid', 400)

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ name: body.name })
        .eq('id', user.id)
      if (error) throw dbError(error)

      return c.json(await loadMe(user), 200)
    }

    // Coach: a player-shaped body ({ name } only) is not enough for a coach update.
    if (!('price' in body) || !('lanes' in body) || !('peakRank' in body) || !('mainHero' in body) || !('bio' in body)) {
      throw new AppError('Data profil coach tidak lengkap', 400)
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ name: body.name })
      .eq('id', user.id)
    if (profileError) throw dbError(profileError)

    const patch = {
      peak_rank: body.peakRank,
      main_hero: body.mainHero,
      price: body.price,
      bio: body.bio,
      lanes: body.lanes,
    }
    // avatar: undefined = leave unchanged, null = clear, url = set.
    if (body.avatar !== undefined) patch.avatar_url = body.avatar

    const { data: updated, error: coachError } = await supabaseAdmin
      .from('coach_profiles')
      .update(patch)
      .eq('id', user.id)
      .select('id')
      .maybeSingle()
    if (coachError) throw dbError(coachError)
    if (!updated) throw new AppError('Profil coach tidak ditemukan', 404)

    return c.json(await loadMe(user), 200)
  },
}
