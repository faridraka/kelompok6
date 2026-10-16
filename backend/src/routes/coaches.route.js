import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { coachesController } from '../controllers/coaches.controller.js'
import { jsonRes } from '../utils/helper.js'
import { ErrorSchema } from '../schemas/common.schema.js'
import { CoachIdParam, CoachListQuery, CoachListResponse, PublicCoachSchema } from '../schemas/coaches.schema.js'

const router = new OpenAPIHono()

const listCoachesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Coaches'],
  summary: 'Daftar coach',
  description:
    'Marketplace publik (tanpa login): hanya coach yang bisa dipesan (price tidak null dan lanes tidak kosong). ' +
    'Query opsional: lane (satu lane atau koma, mis. lane=mid,gold; tiap nilai harus gold/exp/mid/jungle/roam, cocok ANY) ' +
    'dan search (substring nama/mainHero, case-insensitive; kosong = tanpa filter). ' +
    'rating dibulatkan 0-5, vodsCoached = jumlah session bervod, testimonial tidak pernah null.',
  request: { query: CoachListQuery },
  responses: {
    200: jsonRes(CoachListResponse, 'Daftar coach'),
    422: jsonRes(ErrorSchema('Lane tidak valid'), 'Lane tidak valid'),
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
