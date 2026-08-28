import { S3Client } from "@aws-sdk/client-s3";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function getR2Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicUrl
  ) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

export function createR2Client() {
  const config = getR2Config();
  if (!config) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function isAllowedImageType(fileType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(fileType);
}

export function buildObjectKey(fileName: string, fileType: string): string {
  const ext =
    fileType === "image/png"
      ? "png"
      : fileType === "image/webp"
        ? "webp"
        : fileType === "image/gif"
          ? "gif"
          : "jpg";

  const base =
    fileName
      .replace(/^.*[\\/]/, "")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";

  const suffix = Math.random().toString(36).slice(2, 8);
  return `cms/${Date.now()}-${base}-${suffix}.${ext}`;
}

export function buildPublicUrl(objectKey: string): string {
  const config = getR2Config();
  if (!config) {
    throw new Error("R2 public URL is not configured.");
  }
  return `${config.publicUrl}/${objectKey}`;
}
