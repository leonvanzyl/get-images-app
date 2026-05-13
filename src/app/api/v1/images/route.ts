import { NextResponse } from "next/server";
import { authErrorHeaders, jsonError, parsePagination } from "@/app/api/v1/_lib/http";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { listUserImages } from "@/services/images/queries";

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

  const { images, total } = await listUserImages(auth.userId, { limit, offset });

  return NextResponse.json({
    images,
    total,
    limit,
    offset,
  });
}
