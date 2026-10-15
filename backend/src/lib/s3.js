import { S3Client } from '@aws-sdk/client-s3'
import { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } from '../config/env.js';

export const s3 = new S3Client({
  region: "kencana",
  endpoint: "https://kencana.basic.box.cloudeka.id",
  forcePathStyle: true,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

export const BUCKET = "metagames-bucket-li17ed";
