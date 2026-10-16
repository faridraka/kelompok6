import { z } from '@hono/zod-openapi'

// Jam mulai sesi 1 jam, format 'HH:00', hanya 08:00 sampai 22:00.
export const TimeSlotSchema = z
  .string()
  .regex(/^(0[8-9]|1\d|2[0-2]):00$/, 'Jam harus format HH:00 antara 08:00 dan 22:00')
  .openapi({ example: '09:00' })

const daySlots = (example) => z.array(TimeSlotSchema).openapi({ example })

// Body PUT: bentuk yang sama dengan GET. Tepat 7 kunci hari, tiap nilai array string.
// Unik per hari + jarak minimal 3 jam dicek di superRefine (pesan Indonesia, status 422 via defaultHook).
export const AvailabilityBody = z
  .object({
    monday: daySlots(['09:00']),
    tuesday: daySlots([]),
    wednesday: daySlots([]),
    thursday: daySlots([]),
    friday: daySlots([]),
    saturday: daySlots([]),
    sunday: daySlots([]),
  })
  .strict()
  .superRefine((availability, ctx) => {
    for (const day of Object.keys(availability)) {
      const list = availability[day]
      if (new Set(list).size !== list.length) {
        ctx.addIssue({
          code: 'custom',
          path: [day],
          message: `Hari ${day}: jam tidak boleh duplikat`,
        })
      }
      const hours = [...new Set(list)].map((t) => Number(t.slice(0, 2))).sort((a, b) => a - b)
      for (let i = 1; i < hours.length; i++) {
        if (hours[i] - hours[i - 1] < 3) {
          ctx.addIssue({
            code: 'custom',
            path: [day],
            message:
              `Hari ${day}: sesi butuh jeda 2 jam, ` +
              'jadi jam mulai minimal berjarak 3 jam (misalnya 09:00 lalu 12:00 atau lebih)',
          })
          break
        }
      }
    }
  })
  .openapi('AvailabilityBody')
