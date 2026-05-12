import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generation } from "@/lib/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pathname } = await params;
  const blobPath = pathname.join("/");

  if (!blobPath) {
    return NextResponse.json({ error: "Missing pathname" }, { status: 400 });
  }

  const expectedUrl = `/api/blob/${blobPath}`;
  const [owned] = await db
    .select({ id: generation.id })
    .from(generation)
    .where(
      and(
        eq(generation.userId, session.user.id),
        eq(generation.imageUrl, expectedUrl),
      ),
    )
    .limit(1);

  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await get(blobPath, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(result.stream as ReadableStream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Blob fetch failed for path:", blobPath, error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
