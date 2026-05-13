import { NextResponse } from "next/server";
import { z } from "zod";
import { authErrorHeaders, jsonError } from "@/app/api/v1/_lib/http";
import { readImageBytes } from "@/app/api/v1/_lib/storage";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { getUserImage } from "@/services/images/queries";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, undefined, authErrorHeaders(auth));
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return jsonError("Image not found.", 404);
  }

  const result = await getUserImage(auth.userId, id);
  if (!result) {
    return jsonError("Image not found.", 404);
  }

  const { metadata, imageUrl } = result;
  const format = new URL(request.url).searchParams.get("format");
  if (format === "metadata") {
    return NextResponse.json({ image: metadata });
  }

  const bytes = await readImageBytes(imageUrl);
  if (!bytes) {
    return jsonError("Image bytes not found.", 404);
  }

  return NextResponse.json({
    image: {
      ...metadata,
      b64_json: bytes.toString("base64"),
    },
  });
}
