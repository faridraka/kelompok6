import { OpenAPIHono, z, createRoute } from '@hono/zod-openapi'
import { healthController } from '../controllers/health.controller.js'
import { jsonRes } from '../utils/helper.js';
import { ErrorSchema } from '../schemas/common.schema.js';

const router = new OpenAPIHono();

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Cek status API',
  description: 'Endpoint ini digunakan untuk memeriksa apakah API berjalan dengan baik.',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'ok' }),
            timestamp: z.string().openapi({ example: '2026-09-17T10:00:00.000Z' }),
          }),
        },
      },
      description: 'API berjalan normal',
    },
    500: jsonRes(ErrorSchema('Terjadi kesalahan pada server'), 'Terjadi kesalahan pada server'),
  },
})

router.openapi(healthRoute, healthController.check)

export default router
