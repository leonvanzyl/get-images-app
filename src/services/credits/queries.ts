import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditTransaction } from "@/lib/schema";

export type CreditTransaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
};

export async function listCreditTransactions(
  userId: string,
  options: { limit: number; offset: number },
): Promise<{ transactions: CreditTransaction[]; total: number }> {
  const { limit, offset } = options;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: creditTransaction.id,
        amount: creditTransaction.amount,
        type: creditTransaction.type,
        description: creditTransaction.description,
        referenceId: creditTransaction.referenceId,
        createdAt: creditTransaction.createdAt,
      })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId)),
  ]);

  return {
    transactions: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
    total: totalRows[0]?.total ?? 0,
  };
}
