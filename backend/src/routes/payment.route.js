import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { paymentController } from '../controllers/payment.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors, ErrorSchema } from '../schemas/common.schema.js'
import { OrderIdParam, PaymentIdParam, PaymentSchema } from '../schemas/payment.schema.js'

const router = new OpenAPIHono()
const playerOnly = [auth, requireRole('player')]

const createPaymentRoute = createRoute({
  method: 'post',
  path: '/orders/{id}/payment',
  tags: ['Payments'],
  summary: 'Buat payment QRIS (fake)',
  description:
    'Player membuat payment untuk order miliknya. Idempoten: order yang belum dibayar ' +
    'mengembalikan payment pending yang sama. Meet link dibuat saat finish, bukan di sini.',
  middleware: playerOnly,
  security: [{ Bearer: [] }],
  request: { params: OrderIdParam },
  responses: {
    200: jsonRes(PaymentSchema, 'Payment pending yang sudah ada'),
    201: jsonRes(PaymentSchema, 'Payment berhasil dibuat'),
    404: jsonRes(ErrorSchema('Order tidak ditemukan'), 'Order tidak ditemukan / bukan milik player ini'),
    ...authErrors,
  },
})

const getPaymentRoute = createRoute({
  method: 'get',
  path: '/payments/{id}',
  tags: ['Payments'],
  summary: 'Detail payment',
  description: 'Dipoll halaman QRIS sampai status menjadi paid. Hanya untuk player pemilik order.',
  middleware: playerOnly,
  security: [{ Bearer: [] }],
  request: { params: PaymentIdParam },
  responses: {
    200: jsonRes(PaymentSchema, 'Detail payment'),
    404: jsonRes(ErrorSchema('Payment tidak ditemukan'), 'Payment tidak ditemukan / bukan milik player ini'),
    ...authErrors,
  },
})

const finishPaymentRoute = createRoute({
  method: 'post',
  path: '/payments/{id}/finish',
  tags: ['Payments'],
  summary: 'Tandai payment paid (fake)',
  description:
    'Tombol fake "saya sudah bayar". Menandai payment paid, order menjadi scheduled, ' +
    'dan membuat Google Meet untuk 3 sessions. Idempoten, aman di-retry.',
  middleware: playerOnly,
  security: [{ Bearer: [] }],
  request: { params: PaymentIdParam },
  responses: {
    200: jsonRes(PaymentSchema, 'Payment paid'),
    404: jsonRes(ErrorSchema('Payment tidak ditemukan'), 'Payment tidak ditemukan / bukan milik player ini'),
    502: jsonRes(ErrorSchema('Gagal membuat Meet link'), 'Gagal membuat Meet link'),
    ...authErrors,
  },
})

router.openapi(createPaymentRoute, paymentController.create)
router.openapi(getPaymentRoute, paymentController.getById)
router.openapi(finishPaymentRoute, paymentController.finish)

export default router
