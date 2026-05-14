import { ConfigError } from "../errors";
import { generateGoogleImage } from "./google";
import { generateOpenAIImage } from "./openai";
import type { GenerateImageInput, ProviderId } from "../types";

const PROVIDER_ENV_KEYS: Record<ProviderId, string> = {
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

export function getApiKey(providerId: ProviderId): string {
  const envKey = PROVIDER_ENV_KEYS[providerId];
  const key = process.env[envKey];
  if (!key) {
    throw new ConfigError(
      `Missing API key for ${providerId}. Set the ${envKey} environment variable.`,
    );
  }
  return key;
}

export async function callProvider(
  providerId: ProviderId,
  modelId: string,
  input: GenerateImageInput & { thinkingApiValue?: string },
) {
  const apiKey = getApiKey(providerId);

  switch (providerId) {
    case "openai":
      return generateOpenAIImage(input, modelId, apiKey);
    case "google":
      return generateGoogleImage(input, modelId, apiKey);
    default:
      throw new ConfigError(`Unknown provider: ${providerId}`);
  }
}
