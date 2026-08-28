import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "@/lib/env";
import * as schema from "@/lib/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __cmsDb: Db | undefined;
  // eslint-disable-next-line no-var
  var __cmsSql: ReturnType<typeof postgres> | undefined;
}

export function getDb(): Db {
  if (global.__cmsDb) return global.__cmsDb;

  const sql = postgres(requireDatabaseUrl(), {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  const db = drizzle(sql, { schema });
  global.__cmsSql = sql;
  global.__cmsDb = db;
  return db;
}

export async function closeDb(): Promise<void> {
  if (global.__cmsSql) {
    await global.__cmsSql.end();
    global.__cmsSql = undefined;
    global.__cmsDb = undefined;
  }
}

export { schema };
