import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const KNOWN_GENERATION_ERROR_CODES = new Set([
  "VALIDATION_ERROR",
  "INSUFFICIENT_CREDITS",
  "CREDIT_ERROR",
  "USER_ERROR",
]);

const KNOWN_GENERATION_ERROR_NAMES = new Set([
  "ValidationError",
  "InsufficientCreditsError",
]);

const MODERATION_ERROR_CODES = new Set([
  "moderation_blocked",
  "content_policy_violation",
  "safety_violation",
]);

function getProviderCauseError(
  err: unknown,
): { code?: string; message?: string; type?: string } | undefined {
  if (!(err instanceof Error)) return undefined;
  const cause = (err as Error & { cause?: unknown }).cause;
  if (!cause || typeof cause !== "object") return undefined;

  const data = (cause as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !("error" in data)) return undefined;

  const inner = (data as { error: unknown }).error;
  if (!inner || typeof inner !== "object") return undefined;

  const code = (inner as { code?: unknown }).code;
  const message = (inner as { message?: unknown }).message;
  const type = (inner as { type?: unknown }).type;

  return {
    ...(typeof code === "string" ? { code } : {}),
    ...(typeof message === "string" ? { message } : {}),
    ...(typeof type === "string" ? { type } : {}),
  };
}

function isModerationError(
  info: { code?: string; type?: string; message?: string } | undefined,
): boolean {
  if (!info) return false;
  if (info.code && MODERATION_ERROR_CODES.has(info.code)) return true;
  if (info.type === "image_generation_user_error") return true;
  if (info.message && /safety system|content policy|moderation/i.test(info.message)) return true;
  return false;
}

/**
 * Build a `CallToolResult` carrying a user-facing error message.
 *
 * Tools use this when the request itself succeeded (auth, transport) but
 * the operation produced an expected failure (missing record, validation).
 */
export function mcpErrorResult(message: string): CallToolResult {
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

/**
 * Classify an unknown error and return an appropriate `CallToolResult`.
 *
 * Mirrors the REST route's `isKnownGenerationError`: validation and credit
 * errors surface their original message (they're safe and useful to agents);
 * anything else is logged and replaced with a generic fallback so we don't
 * leak internals through the MCP transport.
 */
export function mcpErrorResultFromException(
  err: unknown,
  fallback = "Request failed.",
): CallToolResult {
  if (err instanceof Error) {
    const code = (err as Error & { code?: unknown }).code;
    const isKnown =
      (typeof code === "string" && KNOWN_GENERATION_ERROR_CODES.has(code)) ||
      KNOWN_GENERATION_ERROR_NAMES.has(err.name);

    if (isKnown) {
      return mcpErrorResult(err.message);
    }

    const causeInfo = getProviderCauseError(err);
    if (isModerationError(causeInfo)) {
      return mcpErrorResult(
        "Your prompt was rejected by the image provider's safety filter. Rephrase the prompt — avoid names of real people, copyrighted characters, public figures, or restricted content.",
      );
    }
  }

  console.error("MCP tool error:", err);
  return mcpErrorResult(fallback);
}
