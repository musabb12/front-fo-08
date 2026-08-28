import { NextResponse } from "next/server";
import {
  createAccessToken,
  getRequestActor,
  isValidAdminCredentials,
  verifyAccessToken,
} from "@/lib/cms/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function extractBearer(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/.exec(authHeader.trim());
  return match?.[1]?.trim() ?? null;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`auth:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  const bearer = extractBearer(request.headers.get("authorization"));
  if (bearer && (await verifyAccessToken(bearer))) {
    return NextResponse.json({ ok: true, tokenType: "jwt" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const username =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { username?: unknown }).username === "string"
      ? (body as { username: string }).username.trim()
      : "";
  const password =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!isValidAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const { accessToken, expiresIn } = await createAccessToken();
  return NextResponse.json({
    ok: true,
    accessToken,
    expiresIn,
    tokenType: "bearer",
    actor: getRequestActor(request),
  });
}
