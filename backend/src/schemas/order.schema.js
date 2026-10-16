import { z } from '@hono/zod-openapi'

// Matches what CheckoutPage.jsx sends: { coachId, lane, billing, schedules }.
// Sessions are born scheduled (scheduled_at/end filled) but WITHOUT
// meeting_link: the Meet link is created in the app layer when paid.
export const CreateOrderBody = z
  .object({
    coachId: z.string().uuid(),
    lane: z.enum(['gold', 'exp', 'mid', 'jungle', 'roam']).openapi({ example: 'mid' }),
    billing: z.object({
      firstName: z.string().min(1).openapi({ example: 'Budi' }),
      lastName: z.string().min(1).openapi({ example: 'Santoso' }),
      email: z.string().email().openapi({ example: 'budi@mail.com' }),
      zip: z.string().min(1).optional().openapi({ example: '12345' }),
      state: z.string().min(1).optional().openapi({ example: 'DKI Jakarta' }),
      country: z.string().min(1).optional().openapi({ example: 'Indonesia' }),
    }),
    schedules: z
      .array(z.string().datetime({ offset: true }))
      .length(3)
      .openapi({
        example: ['2026-10-03T20:00:00+07:00', '2026-10-06T20:00:00+07:00', '2026-10-09T20:00:00+07:00'],
        description: '3 waktu mulai sesi pilihan player (ISO 8601). Durasi 1 jam/sesi.',
      }),
  })
  .openapi('CreateOrderBody')

export const OrderIdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
})



export const OrderSchema = z.any().openapi('Order')
export const OrderListResponse = z.array(z.any()).openapi('OrderList')
