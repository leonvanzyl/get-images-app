import { z } from "zod";
import { readImageBytes } from "@/app/api/v1/_lib/storage";
import { verifyImageSignature } from "@/lib/mcp/signed-urls";
import { getImageOwnerAndUrl } from "@/services/images/queries";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

/**
 * Generic 404 used for every failure mode (invalid ID, missing record, bad
 * signature, expired token, missing bytes, unexpected error). The opaque
 * response prevents enumeration of existing IDs and avoids leaking whether
 * a failure was due to signature vs expiry vs missing record.
 */
function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return notFound();
    }

    const url = new URL(request.url);
    const exp = url.searchParams.get("exp");
    const sig = url.searchParams.get("sig");
    if (!exp || !sig) {
      return notFound();
    }

    const expNumber = Number(exp);
    if (!Number.isFinite(expNumber)) {
      return notFound();
    }

    const record = await getImageOwnerAndUrl(id);
    if (!record) {
      return notFound();
    }

    const valid = verifyImageSignature({
      userId: record.userId,
      imageId: id,
      exp: expNumber,
      sig,
    });
    if (!valid) {
      return notFound();
    }

    const bytes = await readImageBytes(record.imageUrl);
    if (!bytes) {
      return notFound();
    }

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": record.mediaType,
        "Cache-Control": "private, max-age=0, must-revalidate",
        "Content-Length": String(bytes.length),
      },
    });
  } catch (err) {
    console.error("MCP file download failed:", err);
    return notFound();
  }
}
