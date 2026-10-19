import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { ratingsController } from '../controllers/ratings.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors } from '../schemas/common.schema.js'
import { RatingsResponse } from '../schemas/ratings.schema.js'

const router = new OpenAPIHono()

const listRatingsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Ratings'],
  summary: 'Daftar rating coach',
  description:
    'Semua rating dari order milik coach yang login (join lewat orders.coach_id). ' +
    'Terbaru dulu (ratedAt menurun). Hanya untuk coach.',
  middleware: [auth, requireRole('coach')],
  security: [{ Bearer: [] }],
  responses: {
    200: jsonRes(RatingsResponse, 'Daftar rating'),
    ...authErrors,
  },
})

router.openapi(listRatingsRoute, ratingsController.list)

export default router
