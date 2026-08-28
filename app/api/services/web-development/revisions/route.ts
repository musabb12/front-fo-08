import { NextResponse } from "next/server";
import { isAuthorizedCmsWrite } from "@/lib/cms/auth";
import { listServiceRevisions } from "@/lib/cms/service-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthorizedCmsWrite(request.headers.get("authorization")))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? "20");
    const revisions = await listServiceRevisions(
      Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20
    );
    return NextResponse.json({ revisions });
  } catch (error) {
    console.error("GET revisions failed:", error);
    return NextResponse.json(
      { error: "Failed to load revision history." },
      { status: 500 }
    );
  }
}
