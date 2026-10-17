import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } from '../config/env.js';

// Bucket dipakai path-style, jadi public URL = endpoint/bucket/key.
export const PUBLIC_BASE_URL = "https://kencana.basic.box.cloudeka.id";

export const s3 = new S3Client({
  region: "kencana",
  endpoint: PUBLIC_BASE_URL,
  forcePathStyle: true,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

export const BUCKET = "metagames-bucket-li17ed";

// Presigned GET dengan Content-Disposition: attachment.
// Alasan: atribut `download` pada <a> diabaikan browser untuk URL cross-origin
// kecuali response-nya menyertakan header Content-Disposition: attachment.
// StorageGRID serve object inline secara default, jadi URL download harus
// di-presign dengan ResponseContentDisposition.
// URL di luar bucket/endpoint ini (mis. mock data) dikembalikan apa adanya.
export const presignDownloadUrl = async (urlString, filename = "recording.mp4") => {
  const prefix = `${PUBLIC_BASE_URL}/${BUCKET}/`;
  if (!urlString || !urlString.startsWith(prefix)) return urlString;
  const key = urlString.slice(prefix.length).split("?")[0];
  // Hilangkan karakter yang merusak header filename="..."
  const safeName = String(filename).replace(/["\\\r\n]/g, "").trim() || "recording.mp4";
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
    }),
    { expiresIn: 86400 }, // 24 jam; list endpoint selalu re-sign saat dipanggil
  );
};
