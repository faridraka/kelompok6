import { z } from '@hono/zod-openapi'

export const PaymentIdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
})

export const OrderIdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
})

export const PaymentSchema = z
  .object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    method: z.enum(['qris']),
    status: z.enum(['pending', 'paid']),
    amount: z.number().int(),
    qrPayload: z.string(),
    expiresAt: z.string(),
  })
  .openapi('Payment')
