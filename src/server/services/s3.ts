import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

let client: S3Client | null = null;

function getClient() {
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY || !env.S3_BUCKET) return null;
  if (client) return client;
  client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT || undefined,
    forcePathStyle: !!env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

export async function createUploadUrl(params: { key: string; contentType: string }) {
  const c = getClient();
  if (!c) {
    // Dev fallback: return a fake URL so the UI can proceed.
    return {
      url: `https://example.invalid/upload/${encodeURIComponent(params.key)}`,
      publicUrl: `https://example.invalid/files/${encodeURIComponent(params.key)}`,
      stubbed: true,
    };
  }
  const cmd = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: params.key,
    ContentType: params.contentType,
  });
  const url = await getSignedUrl(c, cmd, { expiresIn: 600 });
  const publicUrl = env.S3_PUBLIC_BASE_URL
    ? `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${params.key}`
    : `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${params.key}`;
  return { url, publicUrl, stubbed: false };
}

export async function createDownloadUrl(key: string) {
  const c = getClient();
  if (!c) return null;
  return getSignedUrl(c, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), { expiresIn: 600 });
}
