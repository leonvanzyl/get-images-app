import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditBalance, user as userTable } from "@/lib/schema";

export async function getAccountInfo(
  userId: string,
): Promise<{ userId: string; email: string; creditBalance: number } | null> {
  const [row] = await db
    .select({
      email: userTable.email,
      creditBalance: creditBalance.balance,
    })
    .from(userTable)
    .leftJoin(creditBalance, eq(creditBalance.userId, userTable.id))
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    userId,
    email: row.email,
    creditBalance: row.creditBalance ?? 0,
  };
}
