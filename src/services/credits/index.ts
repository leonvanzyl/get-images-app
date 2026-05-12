import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditBalance, creditTransaction } from "@/lib/schema";
import { InsufficientCreditsError } from "./errors";

export { InsufficientCreditsError } from "./errors";

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
 * Deduct a single credit from a user's balance inside a serialisable
 * transaction with a `FOR UPDATE` row lock to prevent double-spend.
 */
export async function deductCredit(userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // Acquire a row-level lock to prevent concurrent deductions.
    // postgres-js returns an array-like RowList directly from execute().
    const rows = await tx.execute(
      sql`SELECT * FROM credit_balance WHERE user_id = ${userId} FOR UPDATE`,
    );

    const row = rows[0] as { balance: number } | undefined;

    if (!row || row.balance < 1) {
      throw new InsufficientCreditsError(
        "No credits remaining on this reel. Add credits to resume production.",
      );
    }

    // Decrement the balance
    await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId));

    // Record the transaction
    await tx.insert(creditTransaction).values({
      userId,
      amount: -1,
      type: "deduction",
      description: "Image generation credit used",
    });
  });
}

/**
 * Refund a single credit back to a user (e.g. after a failed generation).
 */
export async function refundCredit(
  userId: string,
  description?: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    // Increment the balance
    await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId));

    // Record the transaction
    await tx.insert(creditTransaction).values({
      userId,
      amount: 1,
      type: "refund",
      description: description ?? "Credit refunded",
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
): Promise<void> {
  await db.transaction(async (tx) => {
    // Upsert the balance row — insert if new, increment if existing
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

    // Record the transaction
    await tx.insert(creditTransaction).values({
      userId,
      amount,
      type: "addition",
      description: description ?? `Added ${amount} credits`,
    });
  });
}
