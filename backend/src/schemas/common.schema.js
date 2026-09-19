import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Terjadi Kesalahan" }),
  })
  .openapi("Error");

export const ValidationErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Validasi Gagal"}),
    errors: z.any().optional(),
  })
  .openapi("ValidationError");
