import { NextResponse } from "next/server";
import type { ZodIssue } from "zod";

export type ErrorDetail = {
  path: string;
  message: string;
  code: string;
};

export function jsonError(
  message: string,
  status: number,
  details?: ErrorDetail[],
  headers?: HeadersInit
) {
  const init: ResponseInit = headers ? { status, headers } : { status };

  return NextResponse.json(
    {
      error: {
        message,
        ...(details?.length ? { details } : {}),
      },
    },
    init
  );
}

export function authErrorHeaders(auth: { retryAfterSeconds?: number }) {
  return auth.retryAfterSeconds ? { "Retry-After": String(auth.retryAfterSeconds) } : undefined;
}

export function zodIssueDetails(issues: ZodIssue[]): ErrorDetail[] {
  return issues.map((issue) => ({
    path: issue.path.join(".") || "body",
    message: issue.message,
    code: issue.code,
  }));
}

export async function parseJsonBody(
  request: Request
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return {
      ok: false,
      response: jsonError("Invalid JSON request body.", 400),
    };
  }
}

export type Pagination = {
  limit: number;
  offset: number;
};

export function parsePagination(
  searchParams: URLSearchParams
): { ok: true; pagination: Pagination } | { ok: false; response: NextResponse } {
  const limit = parseIntegerParam("limit", searchParams.get("limit"), 20);
  if (!limit.ok) {
    return {
      ok: false,
      response: jsonError("Invalid pagination parameter.", 400, [limit.detail]),
    };
  }

  const offset = parseIntegerParam("offset", searchParams.get("offset"), 0);
  if (!offset.ok) {
    return {
      ok: false,
      response: jsonError("Invalid pagination parameter.", 400, [offset.detail]),
    };
  }

  return {
    ok: true,
    pagination: {
      limit: clamp(limit.value, 1, 100),
      offset: Math.max(offset.value, 0),
    },
  };
}

function parseIntegerParam(
  name: string,
  value: string | null,
  defaultValue: number
): { ok: true; value: number } | { ok: false; detail: ErrorDetail } {
  if (value === null) {
    return { ok: true, value: defaultValue };
  }

  const trimmed = value.trim();
  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    return {
      ok: false,
      detail: {
        path: name,
        message: `${name} must be an integer.`,
        code: "invalid_type",
      },
    };
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    return {
      ok: false,
      detail: {
        path: name,
        message: `${name} must be an integer.`,
        code: "invalid_type",
      },
    };
  }

  return { ok: true, value: parsed };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
