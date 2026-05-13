import { NextResponse } from "next/server";
import { authErrorHeaders, jsonError, parsePagination } from "@/app/api/v1/_lib/http";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { listCreditTransactions } from "@/services/credits/queries";

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

  const { transactions, total } = await listCreditTransactions(auth.userId, { limit, offset });

  return NextResponse.json({
    transactions,
    total,
    limit,
    offset,
  });
}
