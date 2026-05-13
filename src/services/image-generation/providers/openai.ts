import { createOpenAI } from "@ai-sdk/openai";
import { generateImage } from "ai";
import type { GenerateImageInput } from "../types";

// OpenAI gpt-image models accept fixed sizes. Map our aspect ratios to the
// closest supported size. All sizes are divisible by 16 per OpenAI's constraint.
const ASPECT_TO_SIZE: Record<string, `${number}x${number}`> = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "16:9": "1536x1024",
  "4:3": "1536x1024",
  "2:3": "1024x1536",
  "9:16": "1024x1536",
  "3:4": "1024x1536",
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
    size,
  });

  return result.image;
}
