import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { coachesController } from '../controllers/coaches.controller.js'
import { jsonRes } from '../utils/helper.js'
import { ErrorSchema } from '../schemas/common.schema.js'
import { CoachIdParam, CoachListResponse, PublicCoachSchema } from '../schemas/coaches.schema.js'

const router = new OpenAPIHono()

const listCoachesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Coaches'],
  summary: 'Daftar coach',
  description:
    'Marketplace publik (tanpa login): hanya coach yang bisa dipesan (price tidak null dan lanes tidak kosong). ' +
    'rating dibulatkan 0-5, vodsCoached = jumlah session bervod, testimonial tidak pernah null.',
  responses: {
    200: jsonRes(CoachListResponse, 'Daftar coach'),
  },
})

const getCoachRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Coaches'],
  summary: 'Detail coach',
  description: 'Detail publik satu coach beserta availability, rating, dan testimonial. id harus uuid.',
  request: { params: CoachIdParam },
  responses: {
    200: jsonRes(PublicCoachSchema, 'Detail coach'),
    404: jsonRes(ErrorSchema('Coach tidak ditemukan'), 'Coach tidak ditemukan'),
  },
})

router.openapi(listCoachesRoute, coachesController.list)
router.openapi(getCoachRoute, coachesController.getById)

export default router
