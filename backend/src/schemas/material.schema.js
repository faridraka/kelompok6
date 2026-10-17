import { z } from "@hono/zod-openapi";

export const MATERIAL_PREFIX =
  "https://kencana.basic.box.cloudeka.id/metagames-bucket-li17ed/materials/";

export const MaterialTypeSchema = z.enum(["guide", "fundamental"]).openapi({ example: "guide" });

export const CreateMaterialBody = z
  .object({
    type: MaterialTypeSchema,
    title: z.string().min(1).max(200).openapi({ example: "Novaria" }),
    tagline: z.string().max(200).nullish().openapi({ example: "The Sharpshooter" }),
    description: z.string().max(2000).nullish().openapi({ example: "Terrify your enemies with constant poke." }),
    thumbnailUrl: z.string().url().nullish().openapi({ example: null }),
    link: z
      .string()
      .url()
      .refine((url) => url.startsWith(MATERIAL_PREFIX), {
        message: "Link harus URL hasil POST /uploads/materials.",
      })
      .openapi({
        example:
          "https://kencana.basic.box.cloudeka.id/metagames-bucket-li17ed/materials/36573e6b-6a59-4694-837e-67ca498fce28-guide.pdf",
        description: "URL publik file materials (hasil POST /uploads/materials).",
      }),
  })
  .openapi("CreateMaterialBody");

export const MaterialSchema = z
  .object({
    id: z.string().uuid(),
    coachId: z.string().uuid(),
    type: MaterialTypeSchema,
    title: z.string().openapi({ example: "Novaria" }),
    tagline: z.string().nullable().openapi({ example: "The Sharpshooter" }),
    description: z.string().nullable().openapi({ example: "Terrify your enemies with constant poke." }),
    thumbnailUrl: z.string().nullable().openapi({ example: null }),
    link: z.string().openapi({
      example:
        "https://kencana.basic.box.cloudeka.id/metagames-bucket-li17ed/materials/36573e6b-6a59-4694-837e-67ca498fce28-guide.pdf",
    }),
    createdAt: z.string().nullable().openapi({ example: "2026-10-01T09:00:00Z" }),
  })
  .openapi("Material");

export const GetMaterialsQuery = z.object({
  type: MaterialTypeSchema.optional().openapi({
    param: { name: "type", in: "query" },
    example: "guide",
    description: "Opsional: filter berdasarkan tipe material.",
  }),
});
