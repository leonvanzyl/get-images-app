"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { generation } from "@/lib/schema";
import { deleteFile } from "@/lib/storage";
import { getBalance, getAllModelPricing, type ModelPricingRow } from "@/services/credits";
import {
  listModels,
  runGeneration,
  SUPPORTED_ASPECT_RATIOS,
  type GeneratedImage,
  type ImageModelDefinition,
} from "@/services/image-generation";
import { isKnownGenerationError } from "@/services/image-generation/errors";

const generateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const generateInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
  modelId: z.string().min(1),
  aspectRatio: z.enum(SUPPORTED_ASPECT_RATIOS).optional(),
  style: z.string().optional(),
  thinkingLevel: z.enum(["default", "deep"]).optional(),
});

type ActionSuccess = { success: true; data: { image: GeneratedImage } };
type ActionError = { success: false; error: string };
type GenerateActionResult = ActionSuccess | ActionError;

export async function generateImageAction(
  input: z.infer<typeof generateInputSchema>
): Promise<GenerateActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be signed in to generate images." };
  }

  const { success: withinLimit } = generateLimiter.check(session.user.id);
  if (!withinLimit) {
    return {
      success: false,
      error: "Too many requests. Please wait before generating again.",
    };
  }

  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input: " + parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const { prompt, modelId, aspectRatio, style, thinkingLevel } = parsed.data;

  try {
    const generation = await runGeneration(session.user.id, {
      prompt,
      modelId,
      ...(aspectRatio !== undefined ? { aspectRatio } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(thinkingLevel !== undefined ? { thinkingLevel } : {}),
    });
    const result = { image: generation.image };

    revalidatePath("/dashboard", "layout");
    return { success: true, data: result };
  } catch (error) {
    if (isKnownGenerationError(error)) {
      return { success: false, error: error.message };
    }
    console.error("Dashboard image generation failed:", error);
    return { success: false, error: "Image generation failed. Please try again." };
  }
}

export async function getAvailableModelsAction(): Promise<ImageModelDefinition[]> {
  return listModels({ onlyConfigured: true });
}

export type LibraryImage = {
  id: string;
  prompt: string;
  model: string;
  aspect: string;
  style: string;
  thinkingLevel: string | null;
  createdAt: string;
  url: string;
  favorite: boolean;
};

export async function getLibraryImagesAction(): Promise<LibraryImage[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return [];

  const rows = await db
    .select()
    .from(generation)
    .where(eq(generation.userId, session.user.id))
    .orderBy(desc(generation.createdAt));

  return rows.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    model: row.modelId,
    aspect: row.aspectRatio,
    style: row.style ?? "Natural",
    thinkingLevel: row.thinkingLevel,
    createdAt: row.createdAt.toISOString(),
    url: row.imageUrl,
    favorite: false,
  }));
}

export async function getCreditBalanceAction(): Promise<number> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return 0;
  return getBalance(session.user.id);
}

export async function getModelPricingAction(): Promise<ModelPricingRow[]> {
  return getAllModelPricing();
}

export async function deleteGenerationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Not authenticated." };
  }

  const [row] = await db
    .select({ id: generation.id, imageUrl: generation.imageUrl })
    .from(generation)
    .where(and(eq(generation.id, id), eq(generation.userId, session.user.id)))
    .limit(1);

  if (!row) {
    return { success: false, error: "Image not found." };
  }

  // Best-effort storage cleanup. If it throws, log the orphan and still
  // delete the DB row — the user expects the image to disappear from their
  // library, and a transient storage failure shouldn't block that. Ops can
  // sweep orphans from logs.
  try {
    await deleteFile(row.imageUrl);
  } catch (err) {
    console.error(
      `deleteGenerationAction: failed to delete blob for generation ${id} (imageUrl=${row.imageUrl}); orphan possible.`,
      err,
    );
  }

  await db.delete(generation).where(eq(generation.id, id));

  return { success: true };
}
