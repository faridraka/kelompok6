import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { usersController } from '../controllers/users.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors, ErrorSchema } from '../schemas/common.schema.js'
import { MeResponse, UpdateMeBody } from '../schemas/users.schema.js'

const router = new OpenAPIHono()

const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Users'],
  summary: 'Profil sendiri',
  description:
    'Coach: { id, role, name, email, avatar, peakRank, mainHero, price, bio, lanes, availability, timezone: Asia/Jakarta } ' +
    '(availability selalu 7 kunci hari, waktu terurut). ' +
    'Player: { id, role, name, email, avatarUrl: null, avatar: null, bio, timezone }. Bentuk JSON mengikuti role di token.',
  middleware: [auth, requireRole('player', 'coach')],
  security: [{ Bearer: [] }],
  responses: {
    200: jsonRes(MeResponse, 'Profil sendiri'),
    404: jsonRes(ErrorSchema('Profil tidak ditemukan'), 'Profil tidak ditemukan'),
    ...authErrors,
  },
})

const updateMeRoute = createRoute({
  method: 'put',
  path: '/me',
  tags: ['Users'],
  summary: 'Ubah profil sendiri',
  description:
    'Coach: { name, peakRank, mainHero, price, bio, lanes (1-3 dari gold, exp, mid, jungle, roam), avatar } ' +
    '(coach_profiles dulu, lalu name -> profiles; avatar undefined = tidak diubah, null = clear, ' +
    'string = harus URL bucket avatars). Body ketat: field asing ditolak (422). ' +
    'Player: { name } saja. Mengembalikan bentuk yang sama seperti GET.',
  middleware: [auth, requireRole('player', 'coach')],
  security: [{ Bearer: [] }],
  request: {
    body: { required: true, content: { 'application/json': { schema: UpdateMeBody } } },
  },
  responses: {
    200: jsonRes(MeResponse, 'Profil berhasil diubah'),
    400: jsonRes(ErrorSchema('Data profil coach tidak lengkap'), 'Body tidak lengkap / tidak valid'),
    404: jsonRes(ErrorSchema('Profil tidak ditemukan'), 'Profil tidak ditemukan'),
    ...authErrors,
  },
})

router.openapi(getMeRoute, usersController.getMe)
router.openapi(updateMeRoute, usersController.updateMe)

export default router
