import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateImage } from "ai";
import type { GenerateImageInput } from "../types";

/**
 * Generate an image with Google Gemini. The caller (image-generation/index.ts)
 * resolves the model definition and the UI thinking level into a provider
 * thinking value, and passes it as `thinkingApiValue`. This keeps the provider
 * function ignorant of the model registry — it stays a thin SDK adapter.
 */
export async function generateGoogleImage(
  input: GenerateImageInput & { thinkingApiValue?: string },
  modelId: string,
  apiKey: string,
) {
  const google = createGoogleGenerativeAI({ apiKey });

  let prompt = input.prompt;
  if (input.style) {
    prompt = `${prompt}\n\nStyle: ${input.style}`;
  }

  const result = await generateImage({
    model: google.image(modelId),
    prompt,
    ...(input.aspectRatio
      ? { aspectRatio: input.aspectRatio as `${number}:${number}` }
      : {}),
    ...(input.thinkingApiValue
      ? {
          providerOptions: {
            google: {
              thinkingConfig: { thinkingLevel: input.thinkingApiValue },
            },
          },
        }
      : {}),
  });

  return result.image;
}
