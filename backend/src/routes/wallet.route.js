import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { walletController } from '../controllers/wallet.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors } from '../schemas/common.schema.js'
import { WalletResponse } from '../schemas/wallet.schema.js'

const router = new OpenAPIHono()

const getWalletRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Wallet'],
  summary: 'Dompet coach',
  description:
    'Ringkasan pendapatan coach yang login, dihitung dari harga coach + order miliknya ' +
    '(tanpa tabel baru). 1 order = 1 kredit sebesar harga coach. completed -> Available, lainnya Pending.',
  middleware: [auth, requireRole('coach')],
  security: [{ Bearer: [] }],
  responses: {
    200: jsonRes(WalletResponse, 'Dompet coach'),
    ...authErrors,
  },
})

router.openapi(getWalletRoute, walletController.get)

export default router
