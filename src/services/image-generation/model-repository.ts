import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { model as modelTable } from "@/lib/schema";
import type {
  AspectRatio,
  ImageModelDefinition,
  ProviderId,
  ThinkingSupport,
} from "./types";

const PROVIDER_ENV_KEYS: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

type ModelRow = typeof modelTable.$inferSelect;

function isThinkingDefault(v: string | null): v is "minimal" | "low" {
  return v === "minimal" || v === "low";
}

function isThinkingHigh(v: string | null): v is "high" {
  return v === "high";
}

function rowToDefinition(row: ModelRow): ImageModelDefinition {
  // DB stores thinking_default/thinking_high as nullable strings; we narrow
  // them here and only attach `thinking` to the in-memory definition when
  // both halves are populated. The CHECK constraint guarantees they move
  // together, but the runtime check keeps this resilient to bad seed data.
  let thinking: ThinkingSupport | undefined;
  if (isThinkingDefault(row.thinkingDefault) && isThinkingHigh(row.thinkingHigh)) {
    thinking = { default: row.thinkingDefault, deep: row.thinkingHigh };
  }

  return {
    id: row.modelId,
    providerId: row.providerId as ProviderId,
    modelId: row.providerModelId,
    name: row.name,
    description: row.description,
    aspectRatios: row.aspectRatios as AspectRatio[],
    ...(thinking ? { thinking } : {}),
  };
}

function filterByConfiguredProvider(def: ImageModelDefinition): boolean {
  const envKey = PROVIDER_ENV_KEYS[def.providerId];
  return envKey ? Boolean(process.env[envKey]) : false;
}

/**
 * Public, active models in display order. `onlyConfigured: true` filters out
 * models whose provider lacks credentials at runtime — used in the dashboard
 * so the model picker never offers an option that would fail at generate-time.
 */
export const listModels = cache(
  async (opts?: { onlyConfigured?: boolean }): Promise<ImageModelDefinition[]> => {
    const rows = await db
      .select()
      .from(modelTable)
      .where(eq(modelTable.isActive, true))
      .orderBy(asc(modelTable.sortOrder));
    const defs = rows.map(rowToDefinition);
    if (opts?.onlyConfigured) return defs.filter(filterByConfiguredProvider);
    return defs;
  },
);

/**
 * Look up a single model by composite id. Returns null when the model is not
 * found or is currently inactive. Returns inactive models when called via
 * `loadAllModels` instead — see below.
 */
export const getModel = cache(
  async (modelId: string): Promise<ImageModelDefinition | null> => {
    const [row] = await db
      .select()
      .from(modelTable)
      .where(eq(modelTable.modelId, modelId))
      .limit(1);
    if (!row || !row.isActive) return null;
    return rowToDefinition(row);
  },
);

/**
 * Admin-only: returns every row including inactive ones, ordered by sortOrder.
 * Inactive models surface in the admin registry table so operators can
 * re-enable or hard-delete them.
 */
export const loadAllModels = cache(
  async (): Promise<Array<ImageModelDefinition & { isActive: boolean; sortOrder: number; uuid: string }>> => {
    const rows = await db
      .select()
      .from(modelTable)
      .orderBy(asc(modelTable.sortOrder));
    return rows.map((row) => ({
      ...rowToDefinition(row),
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      uuid: row.id,
    }));
  },
);

export type ModelPricingRow = {
  modelId: string;
  creditCost: number;
  thinkingHighCreditCost: number | null;
};

/**
 * Pricing for a single model. Used by the credits service to determine the
 * charge before deducting. The returned row is null when the model is not in
 * the registry (or is inactive) — callers should treat that as an error
 * because we never want to bill an unknown model.
 */
export const loadModelPricing = cache(
  async (modelId: string): Promise<ModelPricingRow | null> => {
    const [row] = await db
      .select({
        modelId: modelTable.modelId,
        creditCost: modelTable.creditCost,
        thinkingHighCreditCost: modelTable.thinkingHighCreditCost,
        isActive: modelTable.isActive,
      })
      .from(modelTable)
      .where(eq(modelTable.modelId, modelId))
      .limit(1);
    if (!row || !row.isActive) return null;
    return {
      modelId: row.modelId,
      creditCost: row.creditCost,
      thinkingHighCreditCost: row.thinkingHighCreditCost,
    };
  },
);

/**
 * Pricing rows for every active model. Powers the public `/pricing` page and
 * the dashboard's per-model price labels.
 */
export const loadAllPricing = cache(async (): Promise<ModelPricingRow[]> => {
  const rows = await db
    .select({
      modelId: modelTable.modelId,
      creditCost: modelTable.creditCost,
      thinkingHighCreditCost: modelTable.thinkingHighCreditCost,
    })
    .from(modelTable)
    .where(eq(modelTable.isActive, true))
    .orderBy(asc(modelTable.sortOrder));
  return rows;
});

export const loadActiveModels = listModels;
