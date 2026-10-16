import { supabaseAdmin } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// users.controller.js punya helper yang sama tapi tidak di-export (file itu tidak boleh diubah),
// jadi helper kecil ini ditulis di sini.
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

const buildAvailability = (rows) => {
  const availability = emptyAvailability()
  for (const row of rows ?? []) {
    if (!DAYS.includes(row.day)) continue
    availability[row.day].push(normalizeTime(row.start_time))
  }
  for (const day of DAYS) availability[day].sort()
  return availability
}

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

const TIME_RE = /^(0[8-9]|1\d|2[0-2]):00$/

// Validasi server-side mengikuti frontend/src/data/availability.js:
// hanya 7 kunci hari, tiap nilai array string 'HH:00' 08:00-22:00, unik per hari,
// jam mulai pada hari yang sama minimal berjarak 3 jam.
const assertValidAvailability = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Availability tidak valid', 422)
  }
  const keys = Object.keys(body)
  const unknown = keys.filter((k) => !DAYS.includes(k))
  if (unknown.length > 0) throw new AppError(`Hari tidak dikenal: ${unknown.join(', ')}`, 422)
  for (const day of DAYS) {
    if (!(day in body)) throw new AppError(`Hari ${day} wajib ada`, 422)
    const list = body[day]
    if (!Array.isArray(list)) throw new AppError(`Hari ${day}: harus berupa array jam`, 422)
    for (const t of list) {
      if (typeof t !== 'string' || !TIME_RE.test(t)) {
        throw new AppError(`Hari ${day}: jam "${t}" tidak valid, harus format HH:00 antara 08:00 dan 22:00`, 422)
      }
    }
    if (new Set(list).size !== list.length) throw new AppError(`Hari ${day}: jam tidak boleh duplikat`, 422)
    const hours = [...new Set(list)].map((t) => Number(t.slice(0, 2))).sort((a, b) => a - b)
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] - hours[i - 1] < 3) {
        throw new AppError(
          `Hari ${day}: sesi butuh jeda 2 jam, jadi jam mulai minimal berjarak 3 jam ` +
            '(misalnya 09:00 lalu 12:00 atau lebih)',
          422,
        )
      }
    }
  }
}

export const availabilityController = {
  // GET /users/me/availability (coach only)
  getAvailability: async (c) => {
    const user = c.get('user')

    const { data, error } = await supabaseAdmin
      .from('coach_availability')
      .select('day, start_time')
      .eq('coach_id', user.id)
    if (error) throw dbError(error)

    return c.json(buildAvailability(data), 200)
  },

  // PUT /users/me/availability (coach only). Mengganti SEMUA baris milik coach ini saja.
  updateAvailability: async (c) => {
    const user = c.get('user')
    const body = c.req.valid('json')

    assertValidAvailability(body)

    // Baris lama dibaca dulu untuk rollback bila insert gagal.
    const { data: oldRows, error: readError } = await supabaseAdmin
      .from('coach_availability')
      .select('day, start_time')
      .eq('coach_id', user.id)
    if (readError) throw dbError(readError)

    const { error: deleteError } = await supabaseAdmin
      .from('coach_availability')
      .delete()
      .eq('coach_id', user.id)
    if (deleteError) throw dbError(deleteError)

    const nextRows = []
    for (const day of DAYS) {
      for (const startTime of [...new Set(body[day])].sort()) {
        nextRows.push({ coach_id: user.id, day, start_time: startTime })
      }
    }

    // Minggu kosong: tidak ada yang perlu di-insert.
    if (nextRows.length === 0) return c.json(emptyAvailability(), 200)

    const { error: insertError } = await supabaseAdmin.from('coach_availability').insert(nextRows)
    if (insertError) {
      // Kembalikan baris lama, lalu lempar error aslinya.
      try {
        if (oldRows?.length) {
          await supabaseAdmin.from('coach_availability').insert(
            oldRows.map((r) => ({ coach_id: user.id, day: r.day, start_time: normalizeTime(r.start_time) })),
          )
        }
      } catch {
        // Error restore diabaikan: yang dilempar tetap error insert aslinya.
      }
      throw dbError(insertError)
    }

    return c.json(buildAvailability(nextRows), 200)
  },
}
