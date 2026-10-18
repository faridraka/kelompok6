import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { walletController } from '../controllers/wallet.controller.js'
import { auth, requireRole } from '../middleware/auth.middleware.js'
import { jsonRes } from '../utils/helper.js'
import { authErrors } from '../schemas/common.schema.js'
import { WalletResponseSchema } from '../schemas/wallet.schema.js'

const router = new OpenAPIHono()

const getWalletRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Wallet'],
  summary: 'Dompet coach',
  description:
    'Ringkasan pendapatan coach yang login, dihitung dari order miliknya (kolom subtotal, tanpa pajak) ' +
    'dan tanpa order berstatus pending_payment. 1 order = 1 player terdaftar = 1 transaksi. ' +
    'completed -> Available, selain itu Pending.',
  middleware: [auth, requireRole('coach')],
  security: [{ Bearer: [] }],
  responses: {
    200: jsonRes(WalletResponseSchema, 'Dompet coach'),
    ...authErrors,
  },
})

router.openapi(getWalletRoute, walletController.get)

export default router
