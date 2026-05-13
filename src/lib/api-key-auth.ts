import { auth } from "@/lib/auth";

export type ApiKeyAuthResult =
  | { ok: true; userId: string; keyId: string }
  | {
      ok: false;
      status: 401 | 429;
      message: string;
      retryAfterSeconds?: number;
    };

const RATE_LIMIT_ERROR_CODES = new Set(["RATE_LIMITED", "RATE_LIMIT_EXCEEDED"]);

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  return token ? token : null;
}

export async function authenticateApiKey(request: Request): Promise<ApiKeyAuthResult> {
  const token = getBearerToken(request);

  if (!token) {
    return { ok: false, status: 401, message: "Missing Bearer token" };
  }

  try {
    const result = await auth.api.verifyApiKey({ body: { key: token } });

    if (!result.valid || !result.key) {
      if (isRateLimitCode(result.error?.code)) {
        return rateLimitError(result.error);
      }

      return { ok: false, status: 401, message: "Invalid or revoked API key" };
    }

    return {
      ok: true,
      userId: result.key.referenceId,
      keyId: result.key.id,
    };
  } catch (error) {
    if (isRateLimitCode(getErrorCode(error))) {
      return rateLimitError(error);
    }

    return { ok: false, status: 401, message: "Invalid or revoked API key" };
  }
}

function rateLimitError(error: unknown): ApiKeyAuthResult {
  const retryAfterSeconds = getRetryAfterSeconds(error);
  return {
    ok: false,
    status: 429,
    message: "Rate limit exceeded",
    ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
  };
}

function isRateLimitCode(code: unknown): boolean {
  return typeof code === "string" && RATE_LIMIT_ERROR_CODES.has(code);
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;

  const body = "body" in error ? error.body : undefined;
  if (body && typeof body === "object" && "code" in body) {
    const code = body.code;
    return typeof code === "string" ? code : undefined;
  }

  if ("code" in error) {
    const code = error.code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}

function getRetryAfterSeconds(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const source =
    "body" in error && error.body && typeof error.body === "object" ? error.body : error;
  if (!("details" in source)) return undefined;

  const details = source.details;
  if (!details || typeof details !== "object" || !("tryAgainIn" in details)) {
    return undefined;
  }

  const tryAgainIn = details.tryAgainIn;
  if (typeof tryAgainIn !== "number" || !Number.isFinite(tryAgainIn)) {
    return undefined;
  }

  return Math.max(1, Math.ceil(tryAgainIn / 1000));
}
