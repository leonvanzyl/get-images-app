import { db } from "@/lib/db";
import { model } from "@/lib/schema";
import { DEFAULT_MODELS } from "@/services/image-generation/default-models";

/**
 * CLI seed — upserts every default model. Useful for local dev and for
 * resetting models to their canonical values. In production, prefer the
 * "Seed defaults" button on /admin/models, which is insert-only and so
 * won't clobber admin edits.
 */
async function main() {
  console.log("Seeding models...");

  for (const data of DEFAULT_MODELS) {
    await db
      .insert(model)
      .values(data)
      .onConflictDoUpdate({
        target: model.modelId,
        set: {
          providerId: data.providerId,
          providerModelId: data.providerModelId,
          name: data.name,
          description: data.description,
          aspectRatios: data.aspectRatios,
          thinkingDefault: data.thinkingDefault,
          thinkingHigh: data.thinkingHigh,
          creditCost: data.creditCost,
          thinkingHighCreditCost: data.thinkingHighCreditCost,
          sortOrder: data.sortOrder,
          updatedAt: new Date(),
        },
      });
    const deep = data.thinkingHighCreditCost
      ? ` (deep: ${data.thinkingHighCreditCost})`
      : "";
    console.log(`  ${data.modelId} → ${data.creditCost} credits${deep}`);
  }

  console.log("Done — seeded", DEFAULT_MODELS.length, "models.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
