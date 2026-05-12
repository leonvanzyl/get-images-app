import type { ImageModelDefinition } from "./types";

export const IMAGE_MODELS: ImageModelDefinition[] = [
  {
    id: "openai:gpt-image-1.5",
    providerId: "openai",
    modelId: "gpt-image-1.5",
    name: "GPT Image 1.5",
    description: "Fast, cost-effective image generation.",
  },
  {
    id: "openai:gpt-image-2",
    providerId: "openai",
    modelId: "gpt-image-2",
    name: "GPT Image 2",
    description: "High-fidelity, prompt-adherent generation.",
  },
  {
    id: "google:gemini-2.5-flash-image",
    providerId: "google",
    modelId: "gemini-2.5-flash-image",
    name: "Nano Banana",
    description: "Fast multimodal image generation.",
  },
  {
    id: "google:gemini-3.1-flash-image-preview",
    providerId: "google",
    modelId: "gemini-3.1-flash-image-preview",
    name: "Nano Banana 2",
    description: "Improved quality and coherence.",
  },
  {
    id: "google:gemini-3-pro-image-preview",
    providerId: "google",
    modelId: "gemini-3-pro-image-preview",
    name: "Nano Banana Pro",
    description: "Highest-quality Gemini image output.",
  },
];

const PROVIDER_ENV_KEYS: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

export function getModel(id: string): ImageModelDefinition | undefined {
  return IMAGE_MODELS.find((m) => m.id === id);
}

export function listModels(options?: {
  onlyConfigured?: boolean;
}): ImageModelDefinition[] {
  if (!options?.onlyConfigured) return IMAGE_MODELS;
  return IMAGE_MODELS.filter((m) => {
    const envKey = PROVIDER_ENV_KEYS[m.providerId];
    return envKey ? Boolean(process.env[envKey]) : false;
  });
}
