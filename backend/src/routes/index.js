import { OpenAPIHono } from '@hono/zod-openapi'
import healthRoutes from './health.route.js'
import authRoutes from './auth.route.js'

const routes = new OpenAPIHono()

routes.route('/', healthRoutes)
routes.route('/auth', authRoutes)

export default routes
