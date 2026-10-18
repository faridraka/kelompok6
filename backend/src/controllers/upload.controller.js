import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET, PUBLIC_BASE_URL } from "../lib/s3.js";
import { AppError } from "../utils/error.js";

const safeName = (name) =>
  String(name || "file").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");

const uploadTo = async (folder, file) => {
  const key = `${folder}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const body = Buffer.from(await file.arrayBuffer());
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
      }),
    );
  } catch (err) {
    console.error(`S3 upload gagal (${folder}):`, err?.name, "-", err?.message);
    throw new AppError("Gagal mengunggah file", 500);
  }
  return `${PUBLIC_BASE_URL}/${BUCKET}/${key}`;
};

export const uploadController = {
  // POST /uploads/avatar — body multipart { file }. Validasi mime di route.
  avatar: async (c) => {
    const { file } = c.req.valid("form");
    if (!file || typeof file.arrayBuffer !== "function")
      throw new AppError("File tidak ditemukan", 400);
    const url = await uploadTo("avatars", file);
    return c.json({ url }, 200);
  },
  // POST /uploads/vod — body multipart { file }. Hanya coach (requireRole di route).
  vod: async (c) => {
    const { file } = c.req.valid("form");
    if (!file || typeof file.arrayBuffer !== "function")
      throw new AppError("File tidak ditemukan", 400);
    const url = await uploadTo("vods", file);
    return c.json({ url }, 200);
  },
  // POST /uploads/materials — body multipart { file }. Hanya coach (requireRole di route).
  material: async (c) => {
    const { file } = c.req.valid("form");
    if (!file || typeof file.arrayBuffer !== "function")
      throw new AppError("File tidak ditemukan", 400);
    const url = await uploadTo("materials", file);
    return c.json({ url }, 200);
  },
};
