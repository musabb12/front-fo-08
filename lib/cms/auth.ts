import { timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import {
  getCmsAdminPassword,
  getCmsAdminUsername,
  getJwtSecret,
} from "@/lib/env";

const JWT_ISSUER = "front-fo-08-cms";
const JWT_AUDIENCE = "cms-admin";
const JWT_TTL = "8h";

function extractBearer(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/.exec(authHeader.trim());
  return match?.[1]?.trim() ?? null;
}

function safeEqual(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Validates admin username + password at login (server-side only). */
export function isValidAdminCredentials(
  username: string | null | undefined,
  password: string | null | undefined
): boolean {
  if (!username || !password) return false;
  return (
    safeEqual(getCmsAdminUsername(), username) &&
    safeEqual(getCmsAdminPassword(), password)
  );
}

/** Issue a short-lived JWT for CMS write operations. */
export async function createAccessToken(): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const expiresIn = 8 * 60 * 60;
  const accessToken = await new SignJWT({ role: "cms_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(JWT_TTL)
    .sign(getJwtSecret());

  return { accessToken, expiresIn };
}

export async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return true;
  } catch {
    return false;
  }
}

/** Authorize CMS mutations (save, upload). Accepts JWT only. */
export async function isAuthorizedCmsWrite(
  authHeader: string | null
): Promise<boolean> {
  const token = extractBearer(authHeader);
  if (!token) return false;
  return verifyAccessToken(token);
}

export function getRequestActor(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
