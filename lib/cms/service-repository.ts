import { promises as fs } from "fs";
import path from "path";
import { desc, eq } from "drizzle-orm";
import { defaultWebDevelopmentService } from "@/lib/cms/defaults";
import { normalizeWebDevelopmentService } from "@/lib/cms/normalize";
import { getDb } from "@/lib/db";
import { contentRevisions, services } from "@/lib/db/schema";
import { isDatabaseConfigured } from "@/lib/env";
import type { WebDevelopmentService } from "@/lib/types";

const SERVICE_SLUG = "web-development";
const LEGACY_JSON = path.join(
  process.cwd(),
  "data",
  "cms",
  "web-development.json"
);

async function readLegacyJson(): Promise<WebDevelopmentService | null> {
  try {
    const raw = await fs.readFile(LEGACY_JSON, "utf8");
    return normalizeWebDevelopmentService(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeLegacyJson(data: WebDevelopmentService): Promise<void> {
  await fs.mkdir(path.dirname(LEGACY_JSON), { recursive: true });
  await fs.writeFile(LEGACY_JSON, JSON.stringify(data, null, 2), "utf8");
}

async function readJsonFallback(): Promise<WebDevelopmentService> {
  const legacy = await readLegacyJson();
  return legacy ?? defaultWebDevelopmentService;
}

async function ensureSeeded(): Promise<void> {
  const db = getDb();
  const existing = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.slug, SERVICE_SLUG))
    .limit(1);

  if (existing.length > 0) return;

  const legacy = await readLegacyJson();
  const content = legacy ?? defaultWebDevelopmentService;

  await db.insert(services).values({
    slug: SERVICE_SLUG,
    content,
    version: 1,
  });

  await db.insert(contentRevisions).values({
    serviceSlug: SERVICE_SLUG,
    content,
    version: 1,
    action: "seed",
    actor: "system",
  });
}

export async function readWebDevelopmentService(): Promise<WebDevelopmentService> {
  if (!isDatabaseConfigured()) {
    return readJsonFallback();
  }

  try {
    await ensureSeeded();
    const db = getDb();
    const rows = await db
      .select()
      .from(services)
      .where(eq(services.slug, SERVICE_SLUG))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return defaultWebDevelopmentService;
    }

    return normalizeWebDevelopmentService(row.content);
  } catch (error) {
    console.error("Database read failed — using JSON fallback:", error);
    return readJsonFallback();
  }
}

export async function writeWebDevelopmentService(
  data: WebDevelopmentService,
  actor = "admin"
): Promise<WebDevelopmentService> {
  const normalized = normalizeWebDevelopmentService(data);
  if (normalized.slug !== SERVICE_SLUG) {
    throw new Error("This CMS store only accepts the web-development service.");
  }

  if (!isDatabaseConfigured()) {
    await writeLegacyJson(normalized);
    return normalized;
  }

  try {
    await ensureSeeded();
    const db = getDb();

    const existing = await db
      .select()
      .from(services)
      .where(eq(services.slug, SERVICE_SLUG))
      .limit(1);

    const current = existing[0];
    const nextVersion = (current?.version ?? 0) + 1;
    const now = new Date();

    if (current) {
      await db.transaction(async (tx) => {
        await tx.insert(contentRevisions).values({
          serviceSlug: SERVICE_SLUG,
          content: normalized,
          version: nextVersion,
          action: "update",
          actor,
        });

        await tx
          .update(services)
          .set({
            content: normalized,
            version: nextVersion,
            updatedAt: now,
          })
          .where(eq(services.slug, SERVICE_SLUG));
      });
    } else {
      await db.transaction(async (tx) => {
        await tx.insert(services).values({
          slug: SERVICE_SLUG,
          content: normalized,
          version: 1,
        });
        await tx.insert(contentRevisions).values({
          serviceSlug: SERVICE_SLUG,
          content: normalized,
          version: 1,
          action: "create",
          actor,
        });
      });
    }

    await writeLegacyJson(normalized);
    return normalized;
  } catch (error) {
    console.error("Database write failed — persisting to JSON only:", error);
    await writeLegacyJson(normalized);
    return normalized;
  }
}

export async function listServiceRevisions(limit = 20) {
  if (!isDatabaseConfigured()) return [];

  try {
    const db = getDb();
    return await db
      .select({
        id: contentRevisions.id,
        version: contentRevisions.version,
        action: contentRevisions.action,
        actor: contentRevisions.actor,
        createdAt: contentRevisions.createdAt,
      })
      .from(contentRevisions)
      .where(eq(contentRevisions.serviceSlug, SERVICE_SLUG))
      .orderBy(desc(contentRevisions.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function pingDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    const db = getDb();
    await db.select({ id: services.id }).from(services).limit(1);
    return true;
  } catch {
    return false;
  }
}
