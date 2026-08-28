import { NextResponse } from "next/server";
import { isAuthorizedCmsWrite } from "@/lib/cms/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  buildObjectKey,
  buildPublicUrl,
  createR2Client,
  getR2Config,
  isAllowedImageType,
} from "@/lib/r2/client";

export const dynamic = "force-dynamic";

const PRESIGN_EXPIRES_SECONDS = 300;

export async function POST(request: Request) {
  if (!(await isAuthorizedCmsWrite(request.headers.get("authorization")))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`upload:${ip}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Upload rate limit exceeded." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  const config = getR2Config();
  const client = createR2Client();
  if (!config || !client) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured on the server." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fileName =
    typeof (body as { fileName?: unknown }).fileName === "string"
      ? (body as { fileName: string }).fileName.trim()
      : "";
  const fileType =
    typeof (body as { fileType?: unknown }).fileType === "string"
      ? (body as { fileType: string }).fileType.trim()
      : "";

  if (!fileName || !fileType) {
    return NextResponse.json(
      { error: "fileName and fileType are required." },
      { status: 400 }
    );
  }

  if (!isAllowedImageType(fileType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and GIF images are allowed." },
      { status: 400 }
    );
  }

  try {
    const objectKey = buildObjectKey(fileName, fileType);
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    });
    const publicUrl = buildPublicUrl(objectKey);

    return NextResponse.json({ uploadUrl, publicUrl, key: objectKey });
  } catch (error) {
    console.error("POST /api/upload failed:", error);
    return NextResponse.json(
      { error: "Failed to create presigned upload URL." },
      { status: 500 }
    );
  }
}
