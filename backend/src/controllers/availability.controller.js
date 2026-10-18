import { supabaseAdmin } from '../lib/supabase.js'
import { DAYS, buildAvailability, normalizeTime } from '../utils/availability.js'

const dbError = (error) => new Error(error.message ?? 'Database error', { cause: error })

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

  // PUT /users/me/availability (coach only). Body sudah divalidasi AvailabilityBody (schema).
  // Simpan sebagai diff: insert slot baru dulu, lalu hapus hanya slot yang hilang.
  updateAvailability: async (c) => {
    const user = c.get('user')
    const body = c.req.valid('json')

    // Baris sekarang, dikunci 'day|HH:MM', nilai mentah disimpan untuk delete yang tepat.
    const { data: oldRows, error: readError } = await supabaseAdmin
      .from('coach_availability')
      .select('day, start_time')
      .eq('coach_id', user.id)
    if (readError) throw dbError(readError)

    const oldByKey = new Map((oldRows ?? []).map((r) => [`${r.day}|${normalizeTime(r.start_time)}`, r.start_time]))

    const nextRows = []
    for (const day of DAYS) {
      for (const startTime of [...new Set(body[day])].sort()) {
        nextRows.push({ coach_id: user.id, day, start_time: startTime })
      }
    }
    const nextKeys = new Set(nextRows.map((r) => `${r.day}|${r.start_time}`))

    const added = nextRows.filter((r) => !oldByKey.has(`${r.day}|${r.start_time}`))
    const removed = [...oldByKey]
      .filter(([key]) => !nextKeys.has(key))
      .map(([key, rawTime]) => ({ day: key.split('|')[0], rawTime }))

    // Insert slot baru PERTAMA kali: bila insert gagal, tidak ada yang dihapus.
    if (added.length > 0) {
      const { error: insertError } = await supabaseAdmin.from('coach_availability').insert(added)
      if (insertError) throw dbError(insertError)
    }

    // Hapus hanya slot yang keluar dari week baru (pakai nilai mentah baris lama).
    for (const { day, rawTime } of removed) {
      const { error: deleteError } = await supabaseAdmin
        .from('coach_availability')
        .delete()
        .eq('coach_id', user.id)
        .eq('day', day)
        .eq('start_time', rawTime)
      if (deleteError) throw dbError(deleteError)
    }

    return c.json({ ok: true }, 200)
  },
}
