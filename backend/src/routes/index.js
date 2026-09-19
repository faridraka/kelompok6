import { OpenAPIHono } from '@hono/zod-openapi'
import healthRoutes from './health.route.js'

const routes = new OpenAPIHono()

routes.route('/', healthRoutes)

export default routes
