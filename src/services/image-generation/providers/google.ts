import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateImage } from "ai";
import type { GenerateImageInput } from "../types";

export async function generateGoogleImage(
  input: GenerateImageInput,
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
  });

  return result.image;
}
