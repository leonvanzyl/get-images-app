export type ProviderId = "openai" | "google";

export const SUPPORTED_ASPECT_RATIOS = [
  "1:1",
  "3:2",
  "2:3",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "21:9",
] as const;

export type AspectRatio = (typeof SUPPORTED_ASPECT_RATIOS)[number];

export type ThinkingLevel = "default" | "deep";

export type ThinkingSupport = {
  /** Provider value sent when the UI selects "default". */
  default: "minimal" | "low";
  /** Provider value sent when the UI selects "deep". */
  deep: "high";
};

export type ImageModelDefinition = {
  id: string;
  providerId: ProviderId;
  modelId: string;
  name: string;
  description: string;
  /** Aspect ratios this model accepts, in display order. */
  aspectRatios: AspectRatio[];
  /** When present, the UI shows a default/deep thinking toggle. */
  thinking?: ThinkingSupport;
};

export type GenerateImageInput = {
  prompt: string;
  modelId: string;
  aspectRatio?: AspectRatio;
  style?: string;
  thinkingLevel?: ThinkingLevel;
  userId: string;
  creditCost?: number;
};

export type GeneratedImage = {
  id: string;
  url: string;
  prompt: string;
  modelId: string;
  providerId: ProviderId;
  aspectRatio: string;
  style?: string;
  thinkingLevel?: ThinkingLevel;
  createdAt: string;
};

export type GenerateImageResult = {
  image: GeneratedImage;
};
