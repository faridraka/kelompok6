import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET } from "../lib/s3.js";
import { AppError } from "../utils/error.js";

// Bucket dipakai path-style, jadi public URL = endpoint/bucket/key.
const PUBLIC_BASE_URL = "https://kencana.basic.box.cloudeka.id";

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
  } catch {
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
};
