import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { reviewController } from '../controllers/review.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors, ErrorSchema } from '../schemas/common.schema.js'
import { RateOrderBody, RateOrderParam, RateOrderResponse, SaveReviewBody, SaveReviewResponse } from '../schemas/review.schema.js'

const router = new OpenAPIHono()

const rateOrderRoute = createRoute({
  method: 'post',
  path: '/{id}/rating',
  tags: ['Orders'],
  summary: 'Beri rating ke coach',
  description:
    'Player memberi rating 1-5 (plus ulasan opsional) ke coach untuk satu order. ' +
    'Order harus milik player, berstatus awaiting_rating, dan coach sudah memberi performance review. ' +
    'Satu order hanya bisa dirating sekali; status order diubah trigger database, bukan backend.',
  middleware: [auth, requireRole('player')],
  security: [{ Bearer: [] }],
  request: {
    params: RateOrderParam,
    body: { required: true, content: { 'application/json': { schema: RateOrderBody } } },
  },
  responses: {
    201: jsonRes(RateOrderResponse, '{ ok: true }'),
    400: jsonRes(ErrorSchema('Coach belum memberi review'), 'Order belum menunggu rating / coach belum memberi review'),
    404: jsonRes(ErrorSchema('Order tidak ditemukan'), 'Order tidak ditemukan / bukan milik player ini'),
    409: jsonRes(ErrorSchema('Order sudah dirating'), 'Order sudah dirating'),
    ...authErrors,
  },
})

router.openapi(rateOrderRoute, reviewController.rate)

const saveReviewRoute = createRoute({
  method: 'post',
  path: '/{id}/performance-review',
  tags: ['Orders'],
  summary: 'Tulis performance review',
  description:
    'Coach menulis atau mengubah performance review untuk satu order miliknya. ' +
    'Semua sesi order harus sudah completed dan order belum completed (belum dirating player). ' +
    'Status order diubah trigger database, bukan backend.',
  middleware: [auth, requireRole('coach')],
  security: [{ Bearer: [] }],
  request: {
    params: RateOrderParam,
    body: { required: true, content: { 'application/json': { schema: SaveReviewBody } } },
  },
  responses: {
    200: jsonRes(SaveReviewResponse, '{ ok: true }'),
    400: jsonRes(ErrorSchema('Selesaikan semua sesi dulu'), 'Order terkunci / sesi belum semuanya completed'),
    404: jsonRes(ErrorSchema('Order tidak ditemukan'), 'Order tidak ditemukan / bukan milik coach ini'),
    ...authErrors,
  },
})

router.openapi(saveReviewRoute, reviewController.savePerformanceReview)

export default router
