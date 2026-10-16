import { z } from '@hono/zod-openapi'
import { CoachAvailabilitySchema, LaneEnum } from './users.schema.js'

export const CoachTestimonialSchema = z
  .object({
    quote: z.string().openapi({ example: 'Rotasinya jadi jauh lebih rapi, makasih coach.' }),
    reviewerInitials: z.string().openapi({ example: 'MH' }),
    reviewerName: z.string().openapi({ example: 'Mars H.' }),
  })
  .openapi('CoachTestimonial')

export const PublicCoachSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().openapi({ example: 'Coach Seemon' }),
    avatar: z.string().nullable().openapi({ example: null }),
    bio: z.string().openapi({ example: 'Head Coach...' }),
    peakRank: z.string().openapi({ example: 'Mythical Immortal' }),
    mainHero: z.string().openapi({ example: 'Ling' }),
    price: z.number().nullable().openapi({ example: 400000 }),
    lanes: z.array(LaneEnum).openapi({ example: ['mid'] }),
    availability: CoachAvailabilitySchema,
    rating: z.number().int().min(0).max(5).openapi({ example: 5 }),
    vodsCoached: z.number().int().min(0).openapi({ example: 12 }),
    testimonial: CoachTestimonialSchema,
  })
  .openapi('PublicCoach')

export const CoachListQuery = z
  .object({
    lane: z
      .string()
      .optional()
      .openapi({
        param: { name: 'lane', in: 'query' },
        example: 'mid,gold',
        description: 'Opsional: satu lane atau daftar dipisah koma (mis. lane=mid,gold). Tiap nilai harus salah satu dari gold, exp, mid, jungle, roam.',
      }),
    search: z
      .string()
      .optional()
      .openapi({
        param: { name: 'search', in: 'query' },
        example: 'ling',
        description: 'Opsional: substring nama atau mainHero, tanpa memperhatikan huruf besar/kecil. Kosong berarti tanpa filter.',
      }),
  })
  .superRefine((query, ctx) => {
    if (query.lane !== undefined) {
      const raw = query.lane.trim()
      if (raw === '') return
      const parts = raw
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part !== '')
      const allowed = ['gold', 'exp', 'mid', 'jungle', 'roam']
      const invalid = parts.filter((part) => !allowed.includes(part))
      if (invalid.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['lane'],
          message: `Lane tidak valid: ${invalid.join(', ')}. Pilih salah satu dari gold, exp, mid, jungle, roam`,
        })
      }
    }
  })
  .openapi('CoachListQuery')

export const CoachIdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
})

export const CoachListResponse = z.array(PublicCoachSchema).openapi('CoachList')
