import { db } from "@/lib/db";
import { generation } from "@/lib/schema";
import { upload } from "@/lib/storage";
import {
  deductCredit,
  getBalance,
  getModelCreditCost,
  refundCredit,
  InsufficientCreditsError,
} from "@/services/credits";
import { ValidationError, ProviderError } from "./errors";
import { getModel } from "./models";
import { callProvider } from "./providers";
import type { GenerateImageInput, GenerateImageResult } from "./types";

export { listModels, getModel } from "./models";
export { SUPPORTED_ASPECT_RATIOS } from "./types";
export type {
  AspectRatio,
  GeneratedImage,
  GenerateImageInput,
  GenerateImageResult,
  ImageModelDefinition,
  ProviderId,
  ThinkingLevel,
} from "./types";

export type RunGenerationInput = Omit<GenerateImageInput, "userId" | "creditCost">;

export type RunGenerationResult = GenerateImageResult & {
  credits: {
    charged: number;
    remaining: number;
  };
};

export async function generate(input: GenerateImageInput): Promise<GenerateImageResult> {
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
      error
    );
  }

  const buffer = Buffer.from(generatedFile.uint8Array);
  const mediaType = generatedFile.mediaType ?? "image/png";
  const ext = mediaType.split("/")[1] ?? "png";
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { url } = await upload(buffer, filename, "generations", {
    maxSize: 20 * 1024 * 1024,
  });

  const now = new Date();

  const [inserted] = await db
    .insert(generation)
    .values({
      userId: input.userId,
      prompt: trimmedPrompt,
      modelId: input.modelId,
      providerId,
      aspectRatio: input.aspectRatio ?? "1:1",
      style: input.style ?? null,
      thinkingLevel: input.thinkingLevel ?? null,
      imageUrl: url,
      mediaType,
      creditCost: input.creditCost ?? null,
      createdAt: now,
    })
    .returning({ id: generation.id });

  return {
    image: {
      id: inserted!.id,
      url,
      prompt: trimmedPrompt,
      modelId: input.modelId,
      providerId,
      aspectRatio: input.aspectRatio ?? "1:1",
      ...(input.style ? { style: input.style } : {}),
      ...(input.thinkingLevel ? { thinkingLevel: input.thinkingLevel } : {}),
      createdAt: now.toISOString(),
    },
    bytes: buffer,
    mediaType,
  };
}

export async function runGeneration(
  userId: string,
  input: RunGenerationInput
): Promise<RunGenerationResult> {
  validateGenerationRequest(input);

  const creditCost = await getModelCreditCost(input.modelId, input.thinkingLevel);
  const balance = await getBalance(userId);

  if (balance < creditCost) {
    throw new InsufficientCreditsError(
      `Not enough credits. This generation costs ${creditCost} credit${creditCost === 1 ? "" : "s"}.`
    );
  }

  let deducted = false;

  try {
    await deductCredit(userId, creditCost);
    deducted = true;

    const result = await generate({
      ...input,
      userId,
      creditCost,
    });
    const remaining = await getBalance(userId);

    return {
      ...result,
      credits: {
        charged: creditCost,
        remaining,
      },
    };
  } catch (error) {
    if (deducted && !(error instanceof InsufficientCreditsError)) {
      try {
        await refundCredit(userId, creditCost, "Generation failed — credits refunded");
      } catch (refundError) {
        console.error(
          `Credit refund failed for user ${userId} after generation error. Manual reconciliation required.`,
          refundError,
        );
      }
    }

    throw error;
  }
}

function validateGenerationRequest(input: RunGenerationInput) {
  const modelDef = getModel(input.modelId);
  if (!modelDef) {
    throw new ValidationError(`Unknown model: ${input.modelId}`);
  }

  if (input.aspectRatio && !modelDef.aspectRatios.includes(input.aspectRatio)) {
    throw new ValidationError(
      `${modelDef.name} does not support ${input.aspectRatio} aspect ratio.`
    );
  }

  if (input.thinkingLevel && !modelDef.thinking) {
    throw new ValidationError(`${modelDef.name} does not support thinking controls.`);
  }
}
