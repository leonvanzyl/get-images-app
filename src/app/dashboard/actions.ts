"use server";

import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generation } from "@/lib/schema";
import {
  generate,
  listModels,
  type GenerateImageResult,
  type ImageModelDefinition,
} from "@/services/image-generation";
import { ImageGenerationError } from "@/services/image-generation/errors";

const generateInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
  modelId: z.string().min(1),
  aspectRatio: z.string().optional(),
  style: z.string().optional(),
  seed: z.number().int().min(0).max(999_999).optional(),
});

type ActionSuccess = { success: true; data: GenerateImageResult };
type ActionError = { success: false; error: string };
type GenerateActionResult = ActionSuccess | ActionError;

export async function generateImageAction(
  input: z.infer<typeof generateInputSchema>,
): Promise<GenerateActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be signed in to generate images." };
  }

  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error:
        "Invalid input: " +
        parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const { prompt, modelId, aspectRatio, style, seed } = parsed.data;
    const result = await generate({
      prompt,
      modelId,
      userId: session.user.id,
      ...(aspectRatio !== undefined ? { aspectRatio } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(seed !== undefined ? { seed } : {}),
    });
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ImageGenerationError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unexpected error occurred during image generation.",
    };
  }
}

export async function getAvailableModelsAction(): Promise<
  ImageModelDefinition[]
> {
  return listModels({ onlyConfigured: true });
}

export type LibraryImage = {
  id: string;
  prompt: string;
  model: string;
  aspect: string;
  style: string;
  seed: number;
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
    style: row.style ?? "Cinematic",
    seed: row.seed ?? 0,
    createdAt: row.createdAt.toISOString(),
    url: row.imageUrl,
    favorite: false,
  }));
}

export async function deleteGenerationAction(
  id: string,
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

  await db
    .delete(generation)
    .where(eq(generation.id, id));

  return { success: true };
}
