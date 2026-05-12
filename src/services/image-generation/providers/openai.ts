import { createOpenAI } from "@ai-sdk/openai";
import { generateImage } from "ai";
import type { GenerateImageInput } from "../types";

const ASPECT_TO_SIZE: Record<string, string> = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "16:9": "1536x1024",
  "2:3": "1024x1536",
  "4:5": "1024x1536",
};

export async function generateOpenAIImage(
  input: GenerateImageInput,
  modelId: string,
  apiKey: string,
) {
  const openai = createOpenAI({ apiKey });
  const size = ASPECT_TO_SIZE[input.aspectRatio ?? "1:1"] ?? "1024x1024";

  let prompt = input.prompt;
  if (input.style) {
    prompt = `${prompt}\n\nStyle: ${input.style}`;
  }

  const result = await generateImage({
    model: openai.image(modelId),
    prompt,
    size: size as `${number}x${number}`,
    ...(input.seed !== undefined ? { seed: input.seed } : {}),
  });

  return result.image;
}
