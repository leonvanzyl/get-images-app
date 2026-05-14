import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/lib/openapi";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getOpenApiDocument(), {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
