import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/lib/openapi";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(getOpenApiDocument(), {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
