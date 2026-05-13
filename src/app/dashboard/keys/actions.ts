"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { ApiKeyMutationResult, ApiKeyView, CreatedApiKeyView } from "@/components/keys/types";
import { auth } from "@/lib/auth";

type RequestHeaders = Awaited<ReturnType<typeof headers>>;

type PluginApiKeyRow = {
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  referenceId: string;
  enabled: boolean;
  lastRequest: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type CreateApiKeyBody = {
  name: string;
};

type UpdateApiKeyBody = {
  keyId: string;
  enabled: boolean;
};

type DeleteApiKeyBody = {
  keyId: string;
};

type ListApiKeysQuery = {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

type ApiKeyAuthApi = {
  createApiKey(input: {
    headers: RequestHeaders;
    body: CreateApiKeyBody;
  }): Promise<PluginApiKeyRow & { key: string }>;
  updateApiKey(input: {
    headers: RequestHeaders;
    body: UpdateApiKeyBody;
  }): Promise<PluginApiKeyRow>;
  deleteApiKey(input: {
    headers: RequestHeaders;
    body: DeleteApiKeyBody;
  }): Promise<{ success: boolean }>;
  listApiKeys(input: {
    headers: RequestHeaders;
    query?: ListApiKeysQuery;
  }): Promise<{ apiKeys: PluginApiKeyRow[] }>;
};

type DeleteApiKeyData = {
  id: string;
};

function apiKeyApi(): ApiKeyAuthApi {
  return auth.api as unknown as ApiKeyAuthApi;
}

function nullableIso(value: Date | string | null): string | null {
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function requiredIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function displayKeyFor(row: PluginApiKeyRow): string {
  const start = row.start?.trim();
  if (start) return `${start}••••••`;
  return `${row.prefix ?? ""}••••••`;
}

function mapApiKey(row: PluginApiKeyRow): ApiKeyView {
  return {
    id: row.id,
    name: row.name?.trim() || "Untitled key",
    start: row.start,
    prefix: row.prefix,
    referenceId: row.referenceId,
    enabled: row.enabled,
    displayKey: displayKeyFor(row),
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
    lastRequest: nullableIso(row.lastRequest),
    status: row.enabled ? "active" : "revoked",
  };
}

function revalidateKeyPages() {
  revalidatePath("/dashboard/keys");
  revalidatePath("/dashboard/integrations");
}

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "body" in error) {
    const body = (error as { body?: { message?: unknown } }).body;
    if (typeof body?.message === "string") return body.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

async function getSessionHeaders() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  return { requestHeaders, session };
}

export async function listApiKeysAction(): Promise<ApiKeyView[]> {
  const { requestHeaders, session } = await getSessionHeaders();
  if (!session?.user) return [];

  try {
    const result = await apiKeyApi().listApiKeys({
      headers: requestHeaders,
      query: { sortBy: "createdAt", sortDirection: "desc" },
    });
    return result.apiKeys.map(mapApiKey);
  } catch (error) {
    console.error("Failed to list API keys", error);
    return [];
  }
}

export async function createApiKeyAction(
  name: string
): Promise<ApiKeyMutationResult<CreatedApiKeyView>> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Enter a key name." };
  }
  if (trimmed.length > 64) {
    return { success: false, error: "Key names must be 64 characters or fewer." };
  }

  const { requestHeaders, session } = await getSessionHeaders();
  if (!session?.user) {
    return { success: false, error: "You must be signed in to create keys." };
  }

  try {
    const result = await apiKeyApi().createApiKey({
      headers: requestHeaders,
      body: { name: trimmed },
    });
    const data = { ...mapApiKey(result), fullKey: result.key };
    revalidateKeyPages();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: errorMessage(error, "Couldn't create the key."),
    };
  }
}

export async function revokeApiKeyAction(id: string): Promise<ApiKeyMutationResult<ApiKeyView>> {
  const keyId = id.trim();
  if (!keyId) {
    return { success: false, error: "Missing key id." };
  }

  const { requestHeaders, session } = await getSessionHeaders();
  if (!session?.user) {
    return { success: false, error: "You must be signed in to revoke keys." };
  }

  try {
    const result = await apiKeyApi().updateApiKey({
      headers: requestHeaders,
      body: { keyId, enabled: false },
    });
    const data = mapApiKey(result);
    revalidateKeyPages();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: errorMessage(error, "Couldn't revoke the key."),
    };
  }
}

export async function deleteApiKeyAction(
  id: string
): Promise<ApiKeyMutationResult<DeleteApiKeyData>> {
  const keyId = id.trim();
  if (!keyId) {
    return { success: false, error: "Missing key id." };
  }

  const { requestHeaders, session } = await getSessionHeaders();
  if (!session?.user) {
    return { success: false, error: "You must be signed in to delete keys." };
  }

  try {
    const result = await apiKeyApi().deleteApiKey({
      headers: requestHeaders,
      body: { keyId },
    });
    if (!result.success) {
      return { success: false, error: "Couldn't delete the key." };
    }
    revalidateKeyPages();
    return { success: true, data: { id: keyId } };
  } catch (error) {
    return {
      success: false,
      error: errorMessage(error, "Couldn't delete the key."),
    };
  }
}
