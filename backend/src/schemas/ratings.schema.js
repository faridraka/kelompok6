import { z } from '@hono/zod-openapi'

export const RatingItemSchema = z
  .object({
    playerNickname: z.string().openapi({ example: 'Mars H.' }),
    rating: z.number().int().min(1).max(5).openapi({ example: 5 }),
    comment: z.string().openapi({ example: 'Rotasinya jadi jauh lebih rapi, makasih coach.' }),
    ratedAt: z.string().nullable().openapi({ example: '2026-09-20T12:00:00+07:00' }),
    orderId: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  })
  .openapi('RatingItem')

export const RatingsResponse = z.array(RatingItemSchema).openapi('RatingsList')
