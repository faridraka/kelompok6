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
    bio: z.string().nullable().openapi({ example: 'Head Coach...' }),
    peakRank: z.string().nullable().openapi({ example: 'Mythical Immortal' }),
    mainHero: z.string().nullable().openapi({ example: 'Ling' }),
    price: z.number().nullable().openapi({ example: 400000 }),
    lanes: z.array(LaneEnum).openapi({ example: ['mid'] }),
    availability: CoachAvailabilitySchema,
    rating: z.number().int().min(0).max(5).openapi({ example: 5 }),
    vodsCoached: z.number().int().min(0).openapi({ example: 12 }),
    testimonial: CoachTestimonialSchema,
  })
  .openapi('PublicCoach')

export const CoachIdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
})

export const CoachListResponse = z.array(PublicCoachSchema).openapi('CoachList')
