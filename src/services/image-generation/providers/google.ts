import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateImage } from "ai";
import { getModel } from "../models";
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

  // Map UI thinking level → provider thinkingLevel for the selected model.
  const modelDef = getModel(input.modelId);
  const thinkingApiValue =
    modelDef?.thinking && input.thinkingLevel
      ? input.thinkingLevel === "deep"
        ? modelDef.thinking.deep
        : modelDef.thinking.default
      : undefined;

  const result = await generateImage({
    model: google.image(modelId),
    prompt,
    ...(input.aspectRatio
      ? { aspectRatio: input.aspectRatio as `${number}:${number}` }
      : {}),
    ...(thinkingApiValue
      ? {
          providerOptions: {
            google: {
              thinkingConfig: { thinkingLevel: thinkingApiValue },
            },
          },
        }
      : {}),
  });

  return result.image;
}
