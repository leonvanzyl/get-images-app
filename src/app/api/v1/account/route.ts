import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { authErrorHeaders, jsonError } from "@/app/api/v1/_lib/http";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { db } from "@/lib/db";
import { creditBalance, user as userTable } from "@/lib/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, undefined, authErrorHeaders(auth));
  }

  const [row] = await db
    .select({
      email: userTable.email,
      creditBalance: creditBalance.balance,
    })
    .from(userTable)
    .leftJoin(creditBalance, eq(creditBalance.userId, userTable.id))
    .where(eq(userTable.id, auth.userId))
    .limit(1);

  if (!row) {
    return jsonError("Account not found.", 404);
  }

  return NextResponse.json({
    userId: auth.userId,
    email: row.email,
    creditBalance: row.creditBalance ?? 0,
  });
}
