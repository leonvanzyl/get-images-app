import { NextResponse } from "next/server";
import { authErrorHeaders, jsonError } from "@/app/api/v1/_lib/http";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAccountInfo } from "@/services/account/queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, undefined, authErrorHeaders(auth));
  }

  const info = await getAccountInfo(auth.userId);
  if (!info) {
    return jsonError("Account not found.", 404);
  }

  return NextResponse.json({
    userId: info.userId,
    email: info.email,
    creditBalance: info.creditBalance,
  });
}
