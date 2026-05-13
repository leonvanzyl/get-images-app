import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generationMetadataSelection, toGenerationMetadata } from "@/app/api/v1/_lib/generations";
import { authErrorHeaders, jsonError } from "@/app/api/v1/_lib/http";
import { readImageBytes } from "@/app/api/v1/_lib/storage";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { db } from "@/lib/db";
import { generation } from "@/lib/schema";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, undefined, authErrorHeaders(auth));
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return jsonError("Image not found.", 404);
  }

  const [row] = await db
    .select({
      ...generationMetadataSelection,
      imageUrl: generation.imageUrl,
    })
    .from(generation)
    .where(and(eq(generation.id, id), eq(generation.userId, auth.userId)))
    .limit(1);

  if (!row) {
    return jsonError("Image not found.", 404);
  }

  const image = toGenerationMetadata(row);
  const format = new URL(request.url).searchParams.get("format");
  if (format === "metadata") {
    return NextResponse.json({ image });
  }

  const bytes = await readImageBytes(row.imageUrl);
  if (!bytes) {
    return jsonError("Image bytes not found.", 404);
  }

  return NextResponse.json({
    image: {
      ...image,
      b64_json: bytes.toString("base64"),
    },
  });
}
