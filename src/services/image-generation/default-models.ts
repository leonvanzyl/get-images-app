/**
 * Canonical list of default models we ship with. Used by:
 *  - `scripts/seed-models.ts` for one-off CLI seeding (idempotent upsert)
 *  - `/admin/models` "Seed defaults" button for production bootstrap
 *    (insert-only, never overwrites admin edits)
 *
 * Keep this in sync with the model capability map in DESIGN.md §14.
 */

import type { AspectRatio, ProviderId } from "./types";

export type DefaultModelSeed = {
  modelId: string;
  providerId: ProviderId;
  providerModelId: string;
  name: string;
  description: string;
  aspectRatios: AspectRatio[];
  thinkingDefault: "minimal" | "low" | null;
  thinkingHigh: "high" | null;
  creditCost: number;
  thinkingHighCreditCost: number | null;
  sortOrder: number;
};

const COMMON_RATIOS: AspectRatio[] = [
  "1:1",
  "3:2",
  "2:3",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
];

export const DEFAULT_MODELS: DefaultModelSeed[] = [
  {
    modelId: "openai:gpt-image-1.5",
    providerId: "openai",
    providerModelId: "gpt-image-1.5",
    name: "GPT Image 1.5",
    description: "Fast and cost-effective. Great for everyday work.",
    aspectRatios: COMMON_RATIOS,
    thinkingDefault: null,
    thinkingHigh: null,
    creditCost: 3,
    thinkingHighCreditCost: null,
    sortOrder: 10,
  },
  {
    modelId: "openai:gpt-image-2",
    providerId: "openai",
    providerModelId: "gpt-image-2",
    name: "GPT Image 2",
    description: "High-fidelity, prompt-adherent. The premium OpenAI option.",
    aspectRatios: COMMON_RATIOS,
    thinkingDefault: null,
    thinkingHigh: null,
    creditCost: 5,
    thinkingHighCreditCost: null,
    sortOrder: 20,
  },
  {
    modelId: "google:gemini-2.5-flash-image",
    providerId: "google",
    providerModelId: "gemini-2.5-flash-image",
    name: "Nano Banana",
    description: "Fast and friendly. Great speed-to-quality ratio.",
    aspectRatios: COMMON_RATIOS,
    thinkingDefault: null,
    thinkingHigh: null,
    creditCost: 3,
    thinkingHighCreditCost: null,
    sortOrder: 30,
  },
  {
    modelId: "google:gemini-3.1-flash-image-preview",
    providerId: "google",
    providerModelId: "gemini-3.1-flash-image-preview",
    name: "Nano Banana 2",
    description: "Improved quality and coherence. Optional deeper thinking.",
    aspectRatios: COMMON_RATIOS,
    thinkingDefault: "minimal",
    thinkingHigh: "high",
    creditCost: 5,
    thinkingHighCreditCost: 7,
    sortOrder: 40,
  },
  {
    modelId: "google:gemini-3-pro-image-preview",
    providerId: "google",
    providerModelId: "gemini-3-pro-image-preview",
    name: "Nano Banana Pro",
    description: "Top-tier Gemini output. Excellent text and complex scenes.",
    aspectRatios: [...COMMON_RATIOS, "21:9"],
    thinkingDefault: "low",
    thinkingHigh: "high",
    creditCost: 12,
    thinkingHighCreditCost: 18,
    sortOrder: 50,
  },
];
