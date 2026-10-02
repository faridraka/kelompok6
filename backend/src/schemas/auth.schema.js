import { z } from '@hono/zod-openapi'
import { RoleSchema, UserSchema } from './common.schema.js'

export const RegisterBody = z
  .object({
    name: z.string().min(2).openapi({ example: 'Budi' }),
    email: z.string().email().openapi({ example: 'budi@mail.com' }),
    password: z.string().min(8).openapi({ example: 'rahasia123' }),
    role: RoleSchema,
  })
  .openapi('RegisterBody')

export const LoginBody = z
  .object({
    email: z.string().email().openapi({ example: 'budi@mail.com' }),
    password: z.string().min(1),
  })
  .openapi('LoginBody')

export const RefreshBody = z
  .object({ refresh_token: z.string() })
  .openapi('RefreshBody')

export const TokenResponse = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
    user: UserSchema,
  })
  .openapi('TokenResponse')

export const RefreshResponse = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  })
  .openapi('RefreshResponse')

