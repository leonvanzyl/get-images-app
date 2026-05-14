"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { generation, model } from "@/lib/schema";
import { getActorId, writeAuditLog } from "@/services/admin/audit";
import {
  SUPPORTED_ASPECT_RATIOS,
  SUPPORTED_PROVIDERS,
} from "@/services/image-generation";
import { DEFAULT_MODELS } from "@/services/image-generation/default-models";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

const modelBaseSchema = z.object({
  modelId: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z]+:[a-z0-9.\-]+$/, {
      message: "Use lowercase provider:model format (e.g. openai:gpt-image-1.5).",
    }),
  providerId: z.enum(SUPPORTED_PROVIDERS),
  providerModelId: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  aspectRatios: z
    .array(z.enum(SUPPORTED_ASPECT_RATIOS))
    .min(1, "Pick at least one aspect ratio."),
  thinkingDefault: z.enum(["minimal", "low"]).nullable(),
  thinkingHigh: z.enum(["high"]).nullable(),
  creditCost: z.number().int().min(1).max(10000),
  thinkingHighCreditCost: z.number().int().min(1).max(10000).nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

const modelCreateSchema = modelBaseSchema
  .refine((v) => v.modelId.startsWith(v.providerId + ":"), {
    message: "modelId must start with the providerId prefix.",
    path: ["modelId"],
  })
  .refine(
    (v) => (v.thinkingDefault === null) === (v.thinkingHigh === null),
    {
      message: "Set both thinking values or neither.",
      path: ["thinkingDefault"],
    },
  )
  .refine(
    (v) =>
      // If no thinking support, thinkingHighCreditCost must also be null.
      !(v.thinkingDefault === null && v.thinkingHighCreditCost !== null),
    {
      message: "Cannot set a deep-thinking cost without thinking support.",
      path: ["thinkingHighCreditCost"],
    },
  );

export type ModelInput = z.infer<typeof modelCreateSchema>;

export async function createModelAction(
  input: ModelInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();
  const parsed = modelCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const data = parsed.data;

  try {
    const [inserted] = await db
      .insert(model)
      .values({
        modelId: data.modelId,
        providerId: data.providerId,
        providerModelId: data.providerModelId,
        name: data.name,
        description: data.description,
        aspectRatios: data.aspectRatios,
        thinkingDefault: data.thinkingDefault,
        thinkingHigh: data.thinkingHigh,
        creditCost: data.creditCost,
        thinkingHighCreditCost: data.thinkingHighCreditCost,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      })
      .returning({ id: model.id });

    await writeAuditLog({
      actorId: getActorId(session),
      action: "model.create",
      targetType: "model",
      targetId: data.modelId,
      after: data,
    });

    revalidatePath("/admin/models");
    revalidatePath("/dashboard");
    revalidatePath("/pricing");
    return { success: true, data: { id: inserted!.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("model_model_id_idx") || message.includes("duplicate")) {
      return { success: false, error: "A model with that ID already exists." };
    }
    console.error("createModelAction failed", err);
    return { success: false, error: "Could not create model." };
  }
}

const modelUpdateSchema = modelBaseSchema
  .omit({ modelId: true })
  .partial()
  .extend({ id: z.string().min(1) });

export type ModelUpdate = z.infer<typeof modelUpdateSchema>;

export async function updateModelAction(
  input: ModelUpdate,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = modelUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const { id, ...patch } = parsed.data;

  const [before] = await db.select().from(model).where(eq(model.id, id)).limit(1);
  if (!before) return { success: false, error: "Model not found." };

  // Enforce thinking pair invariant on the merged values.
  const merged = { ...before, ...patch };
  if (
    (merged.thinkingDefault === null) !==
    (merged.thinkingHigh === null)
  ) {
    return {
      success: false,
      error: "Set both thinking values or neither.",
    };
  }

  try {
    await db
      .update(model)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(model.id, id));
  } catch (err) {
    console.error("updateModelAction failed", err);
    return { success: false, error: "Could not update model." };
  }

  await writeAuditLog({
    actorId: getActorId(session),
    action: "model.update",
    targetType: "model",
    targetId: before.modelId,
    before,
    after: { ...before, ...patch },
  });

  revalidatePath("/admin/models");
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { success: true };
}

const toggleSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
});

export async function toggleModelActiveAction(
  input: z.infer<typeof toggleSchema>,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  const { id, isActive } = parsed.data;

  const [before] = await db
    .select({ modelId: model.modelId, isActive: model.isActive })
    .from(model)
    .where(eq(model.id, id))
    .limit(1);
  if (!before) return { success: false, error: "Model not found." };

  try {
    await db
      .update(model)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(model.id, id));
  } catch (err) {
    console.error("toggleModelActiveAction failed", err);
    return { success: false, error: "Could not toggle model." };
  }

  await writeAuditLog({
    actorId: getActorId(session),
    action: "model.toggle_active",
    targetType: "model",
    targetId: before.modelId,
    before: { isActive: before.isActive },
    after: { isActive },
  });

  revalidatePath("/admin/models");
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { success: true };
}

const deleteSchema = z.object({
  id: z.string().min(1),
  force: z.boolean().optional(),
});

export async function deleteModelAction(
  input: z.infer<typeof deleteSchema>,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  const { id, force } = parsed.data;

  const [before] = await db.select().from(model).where(eq(model.id, id)).limit(1);
  if (!before) return { success: false, error: "Model not found." };

  if (force) {
    // Hard delete refuses if any historical generation references the id —
    // we never want library/history pages to show "Unknown" rows for a
    // permanently-removed model.
    const [{ count: usage } = { count: 0 }] = await db
      .select({ count: generation.id })
      .from(generation)
      .where(eq(generation.modelId, before.modelId))
      .limit(1);

    if (usage) {
      return {
        success: false,
        error:
          "Cannot hard-delete: existing generations reference this model. Deactivate it instead.",
      };
    }

    await db.delete(model).where(eq(model.id, id));
    await writeAuditLog({
      actorId: getActorId(session),
      action: "model.delete",
      targetType: "model",
      targetId: before.modelId,
      before,
      notes: "hard delete",
    });
  } else {
    await db
      .update(model)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(model.id, id));
    await writeAuditLog({
      actorId: getActorId(session),
      action: "model.delete",
      targetType: "model",
      targetId: before.modelId,
      before: { isActive: before.isActive },
      after: { isActive: false },
      notes: "soft delete",
    });
  }

  revalidatePath("/admin/models");
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { success: true };
}

/**
 * Bootstrap the registry from `DEFAULT_MODELS`. Insert-only — existing rows
 * are left untouched (`onConflictDoNothing`), so this is safe to click after
 * admin edits. Returns counts so the UI can show "X added, Y already existed."
 *
 * The intended flow is: after the first production deploy, the operator
 * clicks this button to populate the empty registry; subsequent clicks are
 * idempotent no-ops.
 */
export async function seedDefaultModelsAction(): Promise<
  ActionResult<{ inserted: number; skipped: number }>
> {
  const session = await requireAdmin();

  let inserted = 0;
  let skipped = 0;

  for (const data of DEFAULT_MODELS) {
    const result = await db
      .insert(model)
      .values(data)
      .onConflictDoNothing({ target: model.modelId })
      .returning({ id: model.id });

    if (result.length > 0) inserted++;
    else skipped++;
  }

  if (inserted > 0) {
    await writeAuditLog({
      actorId: getActorId(session),
      action: "model.create",
      targetType: "model",
      targetId: null,
      after: { inserted, skipped, source: "seed-defaults" },
      notes: `Seeded ${inserted} default model(s); ${skipped} already existed.`,
    });
  }

  revalidatePath("/admin/models");
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { success: true, data: { inserted, skipped } };
}
