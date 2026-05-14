import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditBalance, creditTransaction } from "@/lib/schema";
import {
  loadAllPricing,
  loadModelPricing,
  type ModelPricingRow,
} from "@/services/image-generation/model-repository";
import { InsufficientCreditsError } from "./errors";

export { InsufficientCreditsError } from "./errors";
export type { ModelPricingRow } from "@/services/image-generation/model-repository";

/**
 * Retrieve the current credit balance for a user.
 * Returns 0 if no balance row exists yet.
 */
export async function getBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: creditBalance.balance })
    .from(creditBalance)
    .where(eq(creditBalance.userId, userId));

  return row?.balance ?? 0;
}

/**
 * Look up the credit cost for a model. When `deep` thinking is requested and
 * the model has a deep-thinking surcharge configured, that higher cost is used.
 */
export async function getModelCreditCost(
  modelId: string,
  thinkingLevel?: "default" | "deep",
): Promise<number> {
  const row = await loadModelPricing(modelId);

  if (!row) {
    throw new Error(`No active pricing found for model "${modelId}".`);
  }

  if (thinkingLevel === "deep" && row.thinkingHighCreditCost != null) {
    return row.thinkingHighCreditCost;
  }

  return row.creditCost;
}

/**
 * Return all active model pricing rows, including deep-thinking surcharges.
 */
export async function getAllModelPricing(): Promise<ModelPricingRow[]> {
  return loadAllPricing();
}

/**
 * Deduct credits from a user's balance inside a serialisable
 * transaction with a `FOR UPDATE` row lock to prevent double-spend.
 */
export async function deductCredit(
  userId: string,
  amount: number = 1,
): Promise<void> {
  await db.transaction(async (tx) => {
    // Acquire a row-level lock to prevent concurrent deductions.
    const rows = await tx.execute(
      sql`SELECT * FROM credit_balance WHERE user_id = ${userId} FOR UPDATE`,
    );

    const row = rows[0] as { balance: number } | undefined;

    if (!row || row.balance < amount) {
      throw new InsufficientCreditsError(
        "You're out of credits. Add more to keep generating.",
      );
    }

    await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId));

    await tx.insert(creditTransaction).values({
      userId,
      amount: -amount,
      type: "deduction",
      description: `${amount} credit(s) used for image generation`,
    });
  });
}

/**
 * Refund credits back to a user (e.g. after a failed generation).
 */
export async function refundCredit(
  userId: string,
  amount: number = 1,
  description?: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId));

    await tx.insert(creditTransaction).values({
      userId,
      amount,
      type: "refund",
      description: description ?? `${amount} credit(s) refunded`,
    });
  });
}

/**
 * Add credits to a user's balance, creating the balance row if it does not
 * exist yet (upsert via `onConflictDoUpdate`).
 */
export async function addCredits(
  userId: string,
  amount: number,
  description?: string,
  referenceId?: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    if (referenceId) {
      const [existing] = await tx
        .select({ id: creditTransaction.id })
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.referenceId, referenceId),
            eq(creditTransaction.userId, userId),
          ),
        );

      if (existing) {
        return;
      }
    }

    await tx
      .insert(creditBalance)
      .values({
        userId,
        balance: amount,
      })
      .onConflictDoUpdate({
        target: creditBalance.userId,
        set: {
          balance: sql`${creditBalance.balance} + ${amount}`,
          updatedAt: new Date(),
        },
      });

    await tx.insert(creditTransaction).values({
      userId,
      amount,
      type: "addition",
      description: description ?? `Added ${amount} credits`,
      referenceId,
    });
  });
}
