import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { sessionController } from '../controllers/session.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { authErrors, ErrorSchema } from '../schemas/common.schema.js'
import { ScheduleSessionParams, GetSessionsQuery, RecordingBody, SessionSchema } from '../schemas/session.schema.js'
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

const completedSessionRoute = createRoute({
  method: 'patch',
  path: '/{id}/complete',
  tags: ['Sessions'],
  summary: 'Mark Session as Completed',
  description: 'Menandai session tertentu sebagai completed. Player atau coach pemilik order yang bisa melakukan ini.',
  security: [{ Bearer: [] }],
  middleware: [auth],
  request: {
    params: ScheduleSessionParams,
  },
  responses: {
    200: jsonRes(SessionSchema, 'Session yang ditandai sebagai completed'),
    400: jsonRes(ErrorSchema('Invalid request body'), 'Invalid request body'),
    401: authErrors[401],
    403: authErrors[403],
    404: jsonRes(ErrorSchema('Session tidak ditemukan'), 'Session tidak ditemukan'),
  }
})

router.openapi(listSessionsRoute, sessionController.list)
router.openapi(completedSessionRoute, sessionController.completedSession)

const recordingRoute = createRoute({
  method: 'post',
  path: '/{id}/recording',
  tags: ['Sessions'],
  summary: 'Save Session Recording',
  description: 'Menyimpan URL rekaman VOD ke session. Hanya coach pemilik order. Session harus sudah completed.',
  security: [{ Bearer: [] }],
  middleware: [auth, requireRole('coach')],
  request: {
    params: ScheduleSessionParams,
    body: { required: true, content: { 'application/json': { schema: RecordingBody } } },
  },
  responses: {
    200: jsonRes(SessionSchema, 'Session dengan rekaman'),
    400: jsonRes(ErrorSchema('Invalid request'), 'Invalid request'),
    401: authErrors[401],
    403: authErrors[403],
    404: jsonRes(ErrorSchema('Session tidak ditemukan'), 'Session tidak ditemukan'),
  }
})

router.openapi(recordingRoute, sessionController.saveRecording)

export default router
