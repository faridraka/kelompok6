import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { logger } from 'hono/logger'
import { Scalar } from '@scalar/hono-api-reference'
import routes from './routes/index.js'
import { AppError } from './utils/error.js'
import { NODE_ENV, PORT, SERVER_URL } from './config/env.js'
import { serveStatic } from '@hono/node-server/serve-static'

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
    title: 'Metagames API',
    version: '1.0.0',
    description: 'Metagames adalah sebuah platform yang menyediakan layanan coach di berbagai game. Platform ini memungkinkan pengguna untuk mencari dan memesan sesi coaching dengan coach yang berpengalaman di berbagai game populer. Dengan Metagames, pengguna dapat meningkatkan keterampilan mereka dalam bermain game melalui bimbingan langsung dari para ahli.',
    contact: {
      name: 'Kelompok 6',
      email: 'zutto.development@gmail.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    }
  },
  externalDocs: {
    description: "Resource API",
    url: "https://github.com/faridraka/kelompok6"
  },
  servers: [
    { url: `${SERVER_URL}`, description: `${NODE_ENV}` }
  ],
  tags: [
    { name: "System", description: "System related endpoints" },
  ]
})

app.use('/favicon.svg', serveStatic({ path: './favicon.svg' }))

app.get(
  '/',
  Scalar({
    url: '/openapi.json',
    theme: 'purple',
    pageTitle: 'API Docs — Metagames API',
    metaData: {
      title: 'Metagames API Docs',
      description: 'Dokumentasi REST API Metagames — platform coaching game.',
    },
    favicon: '/favicon.svg',
    layout: "modern",
    darkMode: true,
    hideDarkModeToggle: false,
    showSidebar: true,
    hideDownloadButton: false,
    hideClientButton: true,
    expandAllResponses: true,
    defaultOpenAllTags: false,
    orderRequiredPropertiesFirst: true,
    searchHotKey: 'k',
    customCss: `
      .scalar-app { --scalar-font: 'Inter', system-ui, sans-serif; }
    `,
  })
)

serve({
  fetch: app.fetch,
  port: PORT || 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
