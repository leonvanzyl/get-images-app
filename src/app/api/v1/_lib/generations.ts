import { generation } from "@/lib/schema";

export const generationMetadataSelection = {
  id: generation.id,
  prompt: generation.prompt,
  modelId: generation.modelId,
  providerId: generation.providerId,
  aspectRatio: generation.aspectRatio,
  style: generation.style,
  thinkingLevel: generation.thinkingLevel,
  mediaType: generation.mediaType,
  creditCost: generation.creditCost,
  createdAt: generation.createdAt,
} as const;

export type GenerationMetadataRow = {
  id: string;
  prompt: string;
  modelId: string;
  providerId: string;
  aspectRatio: string;
  style: string | null;
  thinkingLevel: string | null;
  mediaType: string;
  creditCost: number | null;
  createdAt: Date;
};

export function toGenerationMetadata(row: GenerationMetadataRow) {
  return {
    id: row.id,
    prompt: row.prompt,
    modelId: row.modelId,
    providerId: row.providerId,
    aspectRatio: row.aspectRatio,
    style: row.style,
    thinkingLevel: row.thinkingLevel,
    mediaType: row.mediaType,
    creditCost: row.creditCost,
    createdAt: row.createdAt.toISOString(),
  };
}
