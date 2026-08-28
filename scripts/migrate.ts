import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required. Example: postgresql://cms:cms@localhost:5432/cms");
  }

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  await sql.end();
  console.log("Migrations applied successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
