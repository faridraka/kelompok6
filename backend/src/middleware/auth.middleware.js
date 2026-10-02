import { createMiddleware } from 'hono/factory'
import { anonClient } from '../lib/supabase.js'
import { AppError } from '../utils/error.js'

export const auth = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new AppError('Unauthorized', 401)

  const { data, error } = await anonClient().auth.getUser(token)
  if (error || !data.user) throw new AppError('Token tidak valid', 401)

  c.set('user', {
    id: data.user.id,
    email: data.user.email,
    role: data.user.app_metadata?.role,
  })
  await next()
})

export const requireRole = (...roles) =>
  createMiddleware(async (c, next) => {
    const user = c.get('user')
    if (!roles.includes(user.role)) throw new AppError('Forbidden', 403)
    await next()
  })
