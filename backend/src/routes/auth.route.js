import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const router = new OpenAPIHono();

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Authentication"],
  summary: "Register Account",
  description: "",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "ok" }),
            timestamp: z
              .string()
              .openapi({ example: "2026-09-17T10:00:00.000Z" }),
          }),
        },
      },
      description: "API berjalan normal",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Internal server error" }),
          }),
        },
      },
      description: "Terjadi kesalahan pada server",
    },
  },
});

router.openapi(registerRoute, (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))

export default router
