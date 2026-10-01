import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authController } from "../controllers/auth.controller.js";
import { jsonRes } from "../utils/helper.js";
import { ErrorSchema } from '../schemas/common.schema.js'

const router = new OpenAPIHono();

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Authentication"],
  summary: "Register Account",
  description: "Endpoint untuk register sebagai player atau coach",
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
    500: jsonRes(ErrorSchema, 'Internal Server Error')
  },
});

router.openapi(registerRoute, authController.register)

export default router
