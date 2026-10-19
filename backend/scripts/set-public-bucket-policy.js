// One-time script: make objects in the bucket publicly readable via a
// bucket policy (anonymous s3:GetObject only — listing stays private).
// Run from backend/: node scripts/set-public-bucket-policy.js
import { PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET } from "../src/lib/s3.js";

const POLICY = JSON.stringify({
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetOnly",
      Effect: "Allow",
      // NB: harus literal "*" (anonymous), BUKAN {"AWS": ["*"]} — StorageGRID
      // mengartikan bentuk {"AWS": [...] } sebagai principal terautentikasi,
      // bukan anonymous, jadi GET tanpa signature tetap 403.
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${BUCKET}/*`,
    },
  ],
});

try {
  await s3.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: POLICY }));
  console.log(`OK: public-read policy applied to bucket "${BUCKET}"`);
} catch (err) {
  console.error(`Bucket policy GAGAL dipasang: ${err.name} — ${err.message}`);
  console.log("Kemungkinan RGW ini ACL-only (policy ditolak). Coba jalankan: node scripts/set-public-acl.js");
  process.exit(1);
}
