import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/cms/service-repository";
import { isDatabaseConfigured } from "@/lib/env";
import { getR2Config } from "@/lib/r2/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbConfigured = isDatabaseConfigured();
  const dbOk = dbConfigured ? await pingDatabase() : false;
  const r2Ok = Boolean(getR2Config());

  const healthy = dbConfigured ? dbOk : true;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: {
        database: dbConfigured ? (dbOk ? "up" : "down") : "not_configured",
        r2: r2Ok ? "configured" : "not_configured",
      },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
