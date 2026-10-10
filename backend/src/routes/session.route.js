import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { sessionController } from '../controllers/session.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { authErrors, ErrorSchema } from '../schemas/common.schema.js'
import { GetSessionsQuery, SessionSchema } from '../schemas/session.schema.js'
import { jsonRes } from '../utils/helper.js'

const router = new OpenAPIHono()

const listSessionsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Sessions'],
  summary: 'List sessions',
  description: 'Mengambil daftar sessions milik user yang login. Jika query orderId diberikan, maka hanya sessions milik order tersebut yang dikembalikan. Order harus milik user yang login.',
  security: [{ Bearer: [] }],
  middleware: [auth],
  request: { query: GetSessionsQuery },
  responses: {
    200: jsonRes(z.array(SessionSchema), 'Daftar sessions'),
    401: authErrors[401],
    403: authErrors[403],
    404: jsonRes(ErrorSchema('Order tidak ditemukan'), 'Order tidak ditemukan'),
  },
})

router.openapi(listSessionsRoute, sessionController.list)

export default router
