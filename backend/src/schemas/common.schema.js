import { z } from "@hono/zod-openapi";
import { jsonRes } from "../utils/helper.js";

export const ErrorSchema = (example = "Terjadi Kesalahan") =>
  z
    .object({
      message: z.string().openapi({
        example,
      }),
    });

export const ValidationErrorSchema = (example = "Validasi Gagal") =>
  z
    .object({
      message: z.string().openapi({ example }),
      errors: z.any().optional(),
  })
  .openapi("ValidationError");

export const RoleSchema = z.enum(['player', 'coach']).openapi({ example: 'player' })

export const UserSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: RoleSchema,
  })
  .openapi('User')

export const authErrors = {
  401: jsonRes(ErrorSchema('Token tidak ada / tidak valid'), 'Token tidak ada / tidak valid'),
  403: jsonRes(ErrorSchema('Role tidak punya akses'), 'Role tidak punya akses'),
}
