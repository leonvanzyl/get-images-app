import { db } from "@/lib/db";
import { generation } from "@/lib/schema";
import { upload } from "@/lib/storage";
import { ValidationError, ProviderError } from "./errors";
import { getModel } from "./models";
import { callProvider } from "./providers";
import type { GenerateImageInput, GenerateImageResult } from "./types";

export { listModels, getModel } from "./models";
export type {
  ImageModelDefinition,
  GenerateImageInput,
  GenerateImageResult,
  GeneratedImage,
  ProviderId,
} from "./types";

export async function generate(
  input: GenerateImageInput,
): Promise<GenerateImageResult> {
  const trimmedPrompt = input.prompt.trim();
  if (!trimmedPrompt) {
    throw new ValidationError("Prompt cannot be empty.");
  }

  const modelDef = getModel(input.modelId);
  if (!modelDef) {
    throw new ValidationError(`Unknown model: ${input.modelId}`);
  }

  const { providerId, modelId: providerModelId } = modelDef;

  let generatedFile;
  try {
    generatedFile = await callProvider(providerId, providerModelId, {
      ...input,
      prompt: trimmedPrompt,
    });
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    if (error && typeof error === "object" && "code" in error) throw error;
    throw new ProviderError(
      `Image generation failed: ${error instanceof Error ? error.message : String(error)}`,
      error,
    );
  }

  const buffer = Buffer.from(generatedFile.uint8Array);
  const ext = generatedFile.mediaType?.split("/")[1] ?? "png";
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { url } = await upload(buffer, filename, "generations", {
    maxSize: 20 * 1024 * 1024,
  });

  const now = new Date();

  const [inserted] = await db.insert(generation).values({
    userId: input.userId,
    prompt: trimmedPrompt,
    modelId: input.modelId,
    providerId,
    aspectRatio: input.aspectRatio ?? "1:1",
    style: input.style ?? null,
    seed: input.seed ?? null,
    imageUrl: url,
    mediaType: generatedFile.mediaType ?? "image/png",
    creditCost: input.creditCost ?? null,
    createdAt: now,
  }).returning({ id: generation.id });

  return {
    image: {
      id: inserted!.id,
      url,
      prompt: trimmedPrompt,
      modelId: input.modelId,
      providerId,
      aspectRatio: input.aspectRatio ?? "1:1",
      ...(input.style ? { style: input.style } : {}),
      ...(input.seed !== undefined ? { seed: input.seed } : {}),
      createdAt: now.toISOString(),
    },
  };
}
