import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> },
) {
  const { pathname } = await params;
  const blobPath = pathname.join("/");

  if (!blobPath) {
    return NextResponse.json({ error: "Missing pathname" }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
