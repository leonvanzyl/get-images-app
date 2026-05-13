import { readFile } from "node:fs/promises";
import path from "node:path";
import { get } from "@vercel/blob";

const LOCAL_UPLOADS_PREFIX = "/uploads/";
const BLOB_ROUTE_PREFIX = "/api/blob/";

export async function readImageBytes(imageUrl: string): Promise<Buffer | null> {
  if (imageUrl.startsWith(LOCAL_UPLOADS_PREFIX)) {
    return readLocalUpload(imageUrl);
  }

  if (imageUrl.startsWith(BLOB_ROUTE_PREFIX)) {
    return readBlobRoute(imageUrl);
  }

  return readAbsoluteUrl(imageUrl);
}

async function readLocalUpload(imageUrl: string): Promise<Buffer | null> {
  let relativePath: string;
  try {
    relativePath = decodeURIComponent(imageUrl.slice(LOCAL_UPLOADS_PREFIX.length));
  } catch {
    return null;
  }

  if (!relativePath || relativePath.includes("\0")) {
    return null;
  }

  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadsRoot, relativePath);
  const relativeFromRoot = path.relative(uploadsRoot, filePath);

  if (!relativeFromRoot || relativeFromRoot.startsWith("..") || path.isAbsolute(relativeFromRoot)) {
    return null;
  }

  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

async function readBlobRoute(imageUrl: string): Promise<Buffer | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return null;
  }

  let blobPath: string;
  try {
    blobPath = decodeURIComponent(imageUrl.slice(BLOB_ROUTE_PREFIX.length));
  } catch {
    return null;
  }

  if (
    !blobPath ||
    blobPath.startsWith("/") ||
    blobPath.includes("\\") ||
    blobPath.split("/").includes("..")
  ) {
    return null;
  }

  try {
    const result = await get(blobPath, {
      access: "private",
      token,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    return streamToBuffer(result.stream);
  } catch {
    return null;
  }
}

async function readAbsoluteUrl(imageUrl: string): Promise<Buffer | null> {
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    chunks.push(value);
    length += value.byteLength;
  }

  return Buffer.concat(chunks, length);
}
