import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { materialController } from "../controllers/material.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";
import { authErrors, ErrorSchema } from "../schemas/common.schema.js";
import { CreateMaterialBody, GetMaterialsQuery, MaterialSchema } from "../schemas/material.schema.js";
import { jsonRes } from "../utils/helper.js";

const router = new OpenAPIHono();

const listMaterialsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Materials"],
  summary: "List materials",
  description:
    "Mengambil daftar materials terbaru dulu. Player melihat semua materials; coach hanya melihat miliknya. Opsional filter ?type=guide|fundamental.",
  security: [{ Bearer: [] }],
  middleware: [auth],
  request: { query: GetMaterialsQuery },
  responses: {
    200: jsonRes(z.array(MaterialSchema), "Daftar materials"),
    401: authErrors[401],
    403: authErrors[403],
  },
});

const createMaterialRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Materials"],
  summary: "Create material",
  description:
    "Membuat material baru. Hanya coach. Field link harus URL hasil POST /uploads/materials.",
  security: [{ Bearer: [] }],
  middleware: [auth, requireRole("coach")],
  request: {
    body: { required: true, content: { "application/json": { schema: CreateMaterialBody } } },
  },
  responses: {
    201: jsonRes(MaterialSchema, "Material yang dibuat"),
    400: jsonRes(ErrorSchema("Invalid request body"), "Invalid request body"),
    401: authErrors[401],
    403: authErrors[403],
  },
});

router.openapi(listMaterialsRoute, materialController.list);
router.openapi(createMaterialRoute, materialController.create);

export default router;
