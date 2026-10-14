import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { auth, requireRole } from "../middleware/auth.middleware.js";
import { uploadController } from "../controllers/upload.controller.js";
import { jsonRes } from "../utils/helper.js";
import { ErrorSchema, authErrors } from "../schemas/common.schema.js";

const router = new OpenAPIHono();

const avatarRoute = createRoute({
  method: "post",
  path: "/avatar",
  tags: ["Uploads"],
  summary: "Upload avatar",
  description:
    "Mengunggah avatar untuk user yang login. Hanya menerima file gambar dengan format PNG, JPG, atau JPEG.",
  security: [{ Bearer: [] }],
  middleware: [auth],
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z
              .instanceof(File)
              .refine((file) => file.type.startsWith("image/"), {
                message:
                  "File harus berupa gambar (png, jpg, webp).",
              })
              .openapi({ type: "string", format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    200: jsonRes(
      z.object({ url: z.string().url() }),
      "URL avatar yang diunggah",
    ),
    400: jsonRes(ErrorSchema("Invalid request body"), "Invalid request body"),
    401: authErrors[401],
    403: authErrors[403],
  },
});

const vodRoute = createRoute({
  method: "post",
  path: "/vod",
  tags: ["Uploads"],
  summary: "Upload VOD",
  description:
    "Mengunggah vod untuk menyimpan video meet. Hanya coach yang dapat mengupload vod.",
  security: [{ Bearer: [] }],
  middleware: [auth, requireRole('coach')],
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z
              .instanceof(File)
              .refine(
                (file) =>
                  file.type.startsWith("video/") ||
                  /\.(mp4|mkv|webm|mov|m4v|avi|ogv)$/i.test(file.name),
                {
                  message:
                    "File harus berupa video (mp4, mkv, webm, mov).",
                },
              )
              .openapi({ type: "string", format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    200: jsonRes(
      z.object({ url: z.string().url() }),
      "URL vod yang diunggah",
    ),
    400: jsonRes(ErrorSchema("Invalid request body"), "Invalid request body"),
    401: authErrors[401],
    403: authErrors[403],
  },
});

router.openapi(avatarRoute, uploadController.avatar)
router.openapi(vodRoute, uploadController.vod)

export default router;
