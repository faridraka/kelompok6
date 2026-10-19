import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { orderController } from '../controllers/order.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors, ErrorSchema } from '../schemas/common.schema.js'
import { CreateOrderBody, OrderIdParam, OrderListResponse, OrderSchema } from '../schemas/order.schema.js'

const router = new OpenAPIHono()

const createOrderRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Orders'],
  summary: 'Buat order',
  description:
    'Player memesan paket 3 sesi dari seorang coach. Harga dihitung server dari harga coach, ' +
    'dan 3 sesi dibuat langsung terjadwal sesuai pilihan player (tanpa Meet link; ' +
    'link dibuat saat pembayaran paid).',
  middleware: [auth, requireRole('player')],
  security: [{ Bearer: [] }],
  request: {
    body: { required: true, content: { 'application/json': { schema: CreateOrderBody } } },
  },
  responses: {
    201: jsonRes(OrderSchema, 'Order berhasil dibuat'),
    400: jsonRes(ErrorSchema('Coach tidak melayani lane ini'), 'Lane tidak valid / coach belum punya harga'),
    404: jsonRes(ErrorSchema('Coach tidak ditemukan'), 'Coach tidak ditemukan'),
    ...authErrors,
  },
})

const listOrdersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Orders'],
  summary: 'Daftar order milik sendiri',
  description:
    'Player: semua order miliknya. Coach: order yang ditujukan ke dia, kecuali yang belum dibayar. ' +
    'Bentuk JSON-nya berbeda untuk player (field coach) dan coach (field player).',
  middleware: [auth, requireRole('player', 'coach')],
  security: [{ Bearer: [] }],
  responses: {
    200: jsonRes(OrderListResponse, 'Daftar order'),
    ...authErrors,
  },
})

const getOrderRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Orders'],
  summary: 'Detail order',
  description: 'Detail order beserta sesi, performance review, dan rating. Hanya untuk player pemilik order.',
  middleware: [auth, requireRole('player')],
  security: [{ Bearer: [] }],
  request: { params: OrderIdParam },
  responses: {
    200: jsonRes(OrderSchema, 'Detail order'),
    404: jsonRes(ErrorSchema('Order tidak ditemukan'), 'Order tidak ditemukan / bukan milik player ini'),
    ...authErrors,
  },
})

router.openapi(createOrderRoute, orderController.create)
router.openapi(listOrdersRoute, orderController.list)
router.openapi(getOrderRoute, orderController.getById)

export default router
