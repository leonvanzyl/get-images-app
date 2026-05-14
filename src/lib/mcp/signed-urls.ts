import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_SECONDS = 900;

/**
 * Build the canonical payload that gets HMAC'd. The userId is signed in but
 * never serialized into the URL — the download route looks up the image's
 * owner from the DB and uses *that* userId for verification. This means a
 * forged URL would need both a valid image ID and a matching secret.
 */
function buildPayload(userId: string, imageId: string, exp: number): string {
  return `${userId}:${imageId}:${exp}`;
}

function getSecret(): string {
  const secret = process.env.MCP_FILE_SIGNING_SECRET;
  if (!secret) {
    throw new Error("MCP_FILE_SIGNING_SECRET is not set");
  }
  return secret;
}

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }
  return raw.replace(/\/+$/, "");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Generate an absolute, signed URL that the caller can hand to any HTTP
 * client to download the image bytes. Default TTL is 15 minutes.
 */
export function signImageUrl(
  userId: string,
  imageId: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const secret = getSecret();
  const baseUrl = getBaseUrl();
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = sign(buildPayload(userId, imageId, exp), secret);

  const url = new URL(`/api/mcp/files/${imageId}`, baseUrl);
  url.searchParams.set("exp", String(exp));
  url.searchParams.set("sig", sig);
  return url.toString();
}

/**
 * Constant-time verify of a signed image URL. Returns false for expired
 * signatures, malformed/short signatures, or any mismatch. Never throws on
 * caller-supplied input — only throws if the server is misconfigured.
 */
export function verifyImageSignature(params: {
  userId: string;
  imageId: string;
  exp: number;
  sig: string;
}): boolean {
  const { userId, imageId, exp, sig } = params;

  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const secret = getSecret();
  const expected = sign(buildPayload(userId, imageId, exp), secret);

  // timingSafeEqual throws when buffer lengths differ — guard first so the
  // length check itself is cheap and constant regardless of input.
  const expectedBuf = Buffer.from(expected, "base64url");
  let providedBuf: Buffer;
  try {
    providedBuf = Buffer.from(sig, "base64url");
  } catch (err) {
    console.error("verifyImageSignature: base64url decode failed", err);
    return false;
  }

  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, providedBuf);
}
