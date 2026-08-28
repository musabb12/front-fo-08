import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  CMS_ADMIN_USERNAME: z.string().min(1).optional(),
  CMS_ADMIN_PASSWORD: z.string().min(8).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  cached = envSchema.parse(process.env);
  return cached;
}

export function getSiteUrl(fallback = "http://localhost:3000"): string {
  return getEnv().NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? fallback;
}

export function getCmsAdminUsername(): string {
  const username = getEnv().CMS_ADMIN_USERNAME;
  if (username) return username;
  if (getEnv().NODE_ENV === "production") {
    throw new Error("CMS_ADMIN_USERNAME must be set in production.");
  }
  return "SD-Developer";
}

export function getCmsAdminPassword(): string {
  const password = getEnv().CMS_ADMIN_PASSWORD;
  if (password) return password;
  if (getEnv().NODE_ENV === "production") {
    throw new Error("CMS_ADMIN_PASSWORD must be set in production.");
  }
  return "SD-Developer80";
}

export function getJwtSecret(): Uint8Array {
  const secret = getEnv().JWT_SECRET;
  if (secret) return new TextEncoder().encode(secret);
  if (getEnv().NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production (min 32 chars).");
  }
  return new TextEncoder().encode("dev-jwt-secret-change-me-in-production!!");
}

export function requireDatabaseUrl(): string {
  const url = getEnv().DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Start Postgres via docker compose up -d and set DATABASE_URL in .env.local."
    );
  }
  return url;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getEnv().DATABASE_URL);
}
