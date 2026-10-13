import { z } from '@hono/zod-openapi'

// Matches what CheckoutPage.jsx sends: { coachId, lane, billing }.
export const CreateOrderBody = z
  .object({
    coachId: z.string().uuid(),
    lane: z.enum(['gold', 'exp', 'mid', 'jungle', 'roam']).openapi({ example: 'mid' }),
    billing: z.object({
      firstName: z.string().min(1).openapi({ example: 'Budi' }),
      lastName: z.string().min(1).openapi({ example: 'Santoso' }),
      email: z.string().email().openapi({ example: 'budi@mail.com' }),
      zip: z.string().min(1).openapi({ example: '12345' }),
      state: z.string().min(1).openapi({ example: 'DKI Jakarta' }),
      country: z.string().min(1).openapi({ example: 'Indonesia' }),
    }),
  })
  .openapi('CreateOrderBody')

export const OrderIdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
})



export const OrderSchema = z.any().openapi('Order')
export const OrderListResponse = z.array(z.any()).openapi('OrderList')
