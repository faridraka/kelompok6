import { z } from '@hono/zod-openapi'

export const RateOrderParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
})

export const RateOrderBody = z
  .object({
    rating: z.number().int().min(1).max(5).openapi({ example: 5 }),
    review: z.string().max(500).optional().openapi({ example: 'Rotasinya jadi jauh lebih rapi, makasih coach.' }),
  })
  .openapi('RateOrderBody')

export const RateOrderResponse = z
  .object({
    rating: z.number().int().min(1).max(5).openapi({ example: 5 }),
    review: z.string().nullable().openapi({ example: 'Rotasinya jadi jauh lebih rapi, makasih coach.' }),
    ratedAt: z.string().nullable().openapi({ example: '2026-09-20T12:00:00+07:00' }),
  })
  .openapi('RateOrderResponse')

export const SaveReviewBody = z
  .object({
    notes: z.string().min(1).openapi({ example: 'Baca draft sudah bagus dan rotasi tepat waktu.' }),
    strengths: z.array(z.string()).openapi({ example: ['Baca draft', 'Rotasi tepat waktu'] }),
    weaknesses: z.array(z.string()).openapi({ example: ['Manajemen cooldown skill'] }),
    recommendation: z.string().optional().openapi({ example: 'Hitung ultimate lawan sebelum engage.' }),
  })
  .openapi('SaveReviewBody')

export const PerformanceReviewSchema = z
  .object({
    notes: z.string().openapi({ example: 'Baca draft sudah bagus dan rotasi tepat waktu.' }),
    strengths: z.array(z.string()).openapi({ example: ['Baca draft', 'Rotasi tepat waktu'] }),
    weaknesses: z.array(z.string()).openapi({ example: ['Manajemen cooldown skill'] }),
    recommendation: z.string().nullable().openapi({ example: 'Hitung ultimate lawan sebelum engage.' }),
  })
  .openapi('PerformanceReview')

export const SaveReviewResponse = z
  .object({
    performanceReview: PerformanceReviewSchema,
    status: z.string().openapi({ example: 'awaiting_rating' }),
  })
  .openapi('SaveReviewResponse')
