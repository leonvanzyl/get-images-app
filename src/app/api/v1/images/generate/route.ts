import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authErrorHeaders,
  jsonError,
  parseJsonBody,
  zodIssueDetails,
} from "@/app/api/v1/_lib/http";
import { authenticateApiKey } from "@/lib/api-key-auth";
import {
  runGeneration,
  SUPPORTED_ASPECT_RATIOS,
  type RunGenerationInput,
} from "@/services/image-generation";

export const runtime = "nodejs";

const generateInputSchema = z
  .object({
    prompt: z.string().trim().min(1).max(2000),
    modelId: z.string().min(1),
    aspectRatio: z.enum(SUPPORTED_ASPECT_RATIOS).optional(),
    style: z.string().optional(),
    thinkingLevel: z.enum(["default", "deep"]).optional(),
  })
  .strict();

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, undefined, authErrorHeaders(auth));
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const parsed = generateInputSchema.safeParse(body.data);
  if (!parsed.success) {
    return jsonError("Invalid request body.", 400, zodIssueDetails(parsed.error.issues));
  }

  try {
    const { prompt, modelId, aspectRatio, style, thinkingLevel } = parsed.data;
    const input: RunGenerationInput = {
      prompt,
      modelId,
      ...(aspectRatio !== undefined ? { aspectRatio } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(thinkingLevel !== undefined ? { thinkingLevel } : {}),
    };
    const result = await runGeneration(auth.userId, input);

    return NextResponse.json({
      image: {
        id: result.image.id,
        prompt: result.image.prompt,
        modelId: result.image.modelId,
        providerId: result.image.providerId,
        aspectRatio: result.image.aspectRatio,
        style: result.image.style ?? null,
        thinkingLevel: result.image.thinkingLevel ?? null,
        mediaType: result.mediaType,
        b64_json: Buffer.from(result.bytes).toString("base64"),
        createdAt: result.image.createdAt,
      },
      credits: result.credits,
    });
  } catch (error) {
    if (isKnownGenerationError(error)) {
      return jsonError(error.message, 400);
    }

    console.error("REST image generation failed:", error);
    return jsonError("Image generation failed.", 500);
  }
}

function isKnownGenerationError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }

  const codedError = error as Error & { code?: unknown };
  const code = typeof codedError.code === "string" ? codedError.code : undefined;

  return (
    code === "VALIDATION_ERROR" ||
    code === "INSUFFICIENT_CREDITS" ||
    code === "CREDIT_ERROR" ||
    code === "USER_ERROR" ||
    error.name === "ValidationError" ||
    error.name === "InsufficientCreditsError"
  );
}
