import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { availabilityController } from '../controllers/availability.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors, ErrorSchema } from '../schemas/common.schema.js'
import { CoachAvailabilitySchema } from '../schemas/users.schema.js'
import { AvailabilityBody } from '../schemas/availability.schema.js'

const router = new OpenAPIHono()

const getAvailabilityRoute = createRoute({
  method: 'get',
  path: '/me/availability',
  tags: ['Users'],
  summary: 'Jadwal mingguan coach',
  description:
    'Mengambil jadwal ketersediaan mingguan coach yang login dari tabel coach_availability. ' +
    'Selalu 7 kunci hari (monday..sunday), waktu terurut.',
  middleware: [auth, requireRole('coach')],
  security: [{ Bearer: [] }],
  responses: {
    200: jsonRes(CoachAvailabilitySchema, 'Jadwal mingguan'),
    ...authErrors,
  },
})

const updateAvailabilityRoute = createRoute({
  method: 'put',
  path: '/me/availability',
  tags: ['Users'],
  summary: 'Simpan jadwal mingguan coach',
  description:
    'Mengganti SEMUA baris coach_availability milik coach yang login saja. ' +
    'Body bentuk yang sama seperti GET. Aturan: hanya 7 kunci hari, jam HH:00 antara 08:00 dan 22:00, ' +
    'unik per hari, dan jam mulai pada hari yang sama minimal berjarak 3 jam (sesi 1 jam + jeda 2 jam).',
  middleware: [auth, requireRole('coach')],
  security: [{ Bearer: [] }],
  request: {
    body: { required: true, content: { 'application/json': { schema: AvailabilityBody } } },
  },
  responses: {
    200: jsonRes(CoachAvailabilitySchema, 'Jadwal yang tersimpan'),
    422: jsonRes(ErrorSchema('Jam tidak valid'), 'Aturan availability dilanggar'),
    ...authErrors,
  },
})

router.openapi(getAvailabilityRoute, availabilityController.getAvailability)
router.openapi(updateAvailabilityRoute, availabilityController.updateAvailability)

export default router
