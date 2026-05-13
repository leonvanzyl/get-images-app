import { NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { authErrorHeaders, jsonError, parsePagination } from "@/app/api/v1/_lib/http";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { db } from "@/lib/db";
import { creditTransaction } from "@/lib/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, undefined, authErrorHeaders(auth));
  }

  const pagination = parsePagination(new URL(request.url).searchParams);
  if (!pagination.ok) {
    return pagination.response;
  }

  const { limit, offset } = pagination.pagination;

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
      .where(eq(creditTransaction.userId, auth.userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, auth.userId)),
  ]);

  return NextResponse.json({
    transactions: rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      description: row.description,
      referenceId: row.referenceId,
      createdAt: row.createdAt.toISOString(),
    })),
    total: totalRows[0]?.total ?? 0,
    limit,
    offset,
  });
}
