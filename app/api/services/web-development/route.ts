import { NextResponse } from "next/server";
import {
  getRequestActor,
  isAuthorizedCmsWrite,
} from "@/lib/cms/auth";
import {
  readWebDevelopmentService,
  writeWebDevelopmentService,
} from "@/lib/cms/service-repository";
import type { WebDevelopmentService } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data: WebDevelopmentService = await readWebDevelopmentService();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/services/web-development failed:", error);
    return NextResponse.json(
      { error: "Failed to load web-development service data." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedCmsWrite(request.headers.get("authorization")))) {
    return NextResponse.json(
      { error: "Unauthorized. Valid CMS session required to update content." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    (body as { slug?: string }).slug !== "web-development"
  ) {
    return NextResponse.json(
      { error: 'Body slug must be "web-development".' },
      { status: 400 }
    );
  }

  try {
    const saved = await writeWebDevelopmentService(
      body as WebDevelopmentService,
      getRequestActor(request)
    );
    return NextResponse.json(saved);
  } catch (error) {
    console.error("PUT /api/services/web-development failed:", error);
    return NextResponse.json(
      { error: "Failed to save web-development service data." },
      { status: 500 }
    );
  }
}
