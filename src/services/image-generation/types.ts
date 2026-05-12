export type ProviderId = "openai" | "google";

export type ImageModelDefinition = {
  id: string;
  providerId: ProviderId;
  modelId: string;
  name: string;
  description: string;
};

export type GenerateImageInput = {
  prompt: string;
  modelId: string;
  aspectRatio?: string;
  style?: string;
  seed?: number;
  userId: string;
};

export type GeneratedImage = {
  id: string;
  url: string;
  prompt: string;
  modelId: string;
  providerId: ProviderId;
  aspectRatio: string;
  style?: string;
  seed?: number;
  createdAt: string;
};

export type GenerateImageResult = {
  image: GeneratedImage;
};
