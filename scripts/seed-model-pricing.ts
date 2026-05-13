import { db } from "@/lib/db";
import { modelPricing } from "@/lib/schema";

const PRICING_DATA: Array<{
  modelId: string;
  creditCost: number;
  thinkingHighCreditCost?: number;
}> = [
  { modelId: "openai:gpt-image-1.5", creditCost: 3 },
  { modelId: "openai:gpt-image-2", creditCost: 5 },
  { modelId: "google:gemini-2.5-flash-image", creditCost: 3 },
  {
    modelId: "google:gemini-3.1-flash-image-preview",
    creditCost: 5,
    thinkingHighCreditCost: 7,
  },
  {
    modelId: "google:gemini-3-pro-image-preview",
    creditCost: 12,
    thinkingHighCreditCost: 18,
  },
];

async function main() {
  console.log("Seeding model pricing...");

  for (const data of PRICING_DATA) {
    await db
      .insert(modelPricing)
      .values(data)
      .onConflictDoUpdate({
        target: modelPricing.modelId,
        set: {
          creditCost: data.creditCost,
          thinkingHighCreditCost: data.thinkingHighCreditCost ?? null,
          updatedAt: new Date(),
        },
      });
    const deep = data.thinkingHighCreditCost
      ? ` (deep: ${data.thinkingHighCreditCost})`
      : "";
    console.log(`  ${data.modelId} → ${data.creditCost} credits${deep}`);
  }

  console.log("Done — seeded", PRICING_DATA.length, "models.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
