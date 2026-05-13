import { NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { generationMetadataSelection, toGenerationMetadata } from "@/app/api/v1/_lib/generations";
import { authErrorHeaders, jsonError, parsePagination } from "@/app/api/v1/_lib/http";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { db } from "@/lib/db";
import { generation } from "@/lib/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, undefined, authErrorHeaders(auth));
  }

  const pagination = parsePagination(new URL(request.url).searchParams);
  if (!pagination.ok) {
    return pagination.response;
  }

  const { limit, offset } = pagination.pagination;

  const [rows, totalRows] = await Promise.all([
    db
      .select(generationMetadataSelection)
      .from(generation)
      .where(eq(generation.userId, auth.userId))
      .orderBy(desc(generation.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(generation).where(eq(generation.userId, auth.userId)),
  ]);

  return NextResponse.json({
    images: rows.map(toGenerationMetadata),
    total: totalRows[0]?.total ?? 0,
    limit,
    offset,
  });
}
