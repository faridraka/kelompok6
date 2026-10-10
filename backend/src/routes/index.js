import { OpenAPIHono } from '@hono/zod-openapi'
import healthRoutes from './health.route.js'
import authRoutes from './auth.route.js'
import sessionRoutes from './session.route.js'
import uploadRoutes from './upload.route.js'

const routes = new OpenAPIHono()

routes.route('/', healthRoutes)
routes.route('/auth', authRoutes)
routes.route('/sessions', sessionRoutes)
routes.route('/uploads', uploadRoutes)

export default routes
