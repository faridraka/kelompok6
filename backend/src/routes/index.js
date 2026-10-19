import { OpenAPIHono } from '@hono/zod-openapi'
import healthRoutes from './health.route.js'
import authRoutes from './auth.route.js'
import sessionRoutes from './session.route.js'
import uploadRoutes from './upload.route.js'
import orderRoutes from './order.route.js'
import usersRoutes from './users.route.js'
import availabilityRoutes from './availability.route.js'
import coachesRoutes from './coaches.route.js'
import materialRoutes from './material.route.js'
import ratingsRoutes from './ratings.route.js'
import reviewRoutes from './review.route.js'
import paymentRoutes from './payment.route.js'
import walletRoutes from './wallet.route.js'

const routes = new OpenAPIHono()

routes.route('/', healthRoutes)
routes.route('/auth', authRoutes)
routes.route('/sessions', sessionRoutes)
routes.route('/uploads', uploadRoutes)
routes.route('/orders', orderRoutes)
routes.route('/orders', reviewRoutes)
routes.route('/users', usersRoutes)
routes.route('/users', availabilityRoutes)
routes.route('/coaches', coachesRoutes)
routes.route('/materials', materialRoutes)
routes.route('/ratings', ratingsRoutes)
routes.route('/', paymentRoutes)
routes.route('/wallet', walletRoutes)

export default routes
