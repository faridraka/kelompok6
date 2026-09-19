import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { logger } from 'hono/logger'
import { Scalar } from '@scalar/hono-api-reference'
import routes from './routes/index.js'
import { AppError } from './utils/error.js'
import { NODE_ENV, PORT, SERVER_URL } from './config/env.js'

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        { message: 'Validasi gagal', errors: result.error.flatten() },
        422
      )
    }
  },
})

app.use('*', logger())

app.route('/', routes)

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ message: err.message }, err.status)
  }
  console.error(err)
  return c.json({ message: 'Internal server error' }, 500)
})

app.notFound((c) => c.json({ message: 'Endpoint tidak ditemukan' }, 404))

app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'API Tugas Web App',
    version: '1.0.0',
    description: 'Dokumentasi API backend Hono',
    contact: {
      name: 'Kelompok 6',
      email: 'zutto.development@gmail.com'
    },
  },
  servers: [
    { url: `${SERVER_URL}`, description: `${NODE_ENV}` }
  ],
})

app.get(
  '/',
  Scalar({
    url: '/openapi.json',
    theme: 'purple',
    pageTitle: 'API Docs — Tugas Web App',
    layout: 'modern',
    hideDarkModeToggle: false,
    _integration: 'hono',
    expandAllResponses: true,
    hideClientButton: true,
  })
)

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

serve({
  fetch: app.fetch,
  port: PORT || 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
