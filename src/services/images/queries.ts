import { and, count, desc, eq } from "drizzle-orm";
import { generationMetadataSelection, toGenerationMetadata } from "@/app/api/v1/_lib/generations";
import { db } from "@/lib/db";
import { generation } from "@/lib/schema";

export type GenerationMetadata = ReturnType<typeof toGenerationMetadata>;

export async function listUserImages(
  userId: string,
  options: { limit: number; offset: number },
): Promise<{ images: GenerationMetadata[]; total: number }> {
  const { limit, offset } = options;

  const [rows, totalRows] = await Promise.all([
    db
      .select(generationMetadataSelection)
      .from(generation)
      .where(eq(generation.userId, userId))
      .orderBy(desc(generation.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(generation).where(eq(generation.userId, userId)),
  ]);

  return {
    images: rows.map(toGenerationMetadata),
    total: totalRows[0]?.total ?? 0,
  };
}

export async function getUserImage(
  userId: string,
  imageId: string,
): Promise<{ metadata: GenerationMetadata; imageUrl: string } | null> {
  const [row] = await db
    .select({
      ...generationMetadataSelection,
      imageUrl: generation.imageUrl,
    })
    .from(generation)
    .where(and(eq(generation.id, imageId), eq(generation.userId, userId)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    metadata: toGenerationMetadata(row),
    imageUrl: row.imageUrl,
  };
}

/**
 * ID-only lookup used by the signed-URL download route: the route verifies
 * the HMAC against the *DB-resolved* owner, so we must fetch by ID without
 * scoping to a userId upfront.
 */
export async function getImageOwnerAndUrl(
  imageId: string,
): Promise<{ userId: string; imageUrl: string; mediaType: string } | null> {
  const [row] = await db
    .select({
      userId: generation.userId,
      imageUrl: generation.imageUrl,
      mediaType: generation.mediaType,
    })
    .from(generation)
    .where(eq(generation.id, imageId))
    .limit(1);

  if (!row) {
    return null;
  }

  return row;
}
