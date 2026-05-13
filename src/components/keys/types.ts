export type ApiKeyStatus = "active" | "revoked";

export type ApiKeyView = {
  id: string;
  name: string;
  start: string | null;
  prefix: string | null;
  referenceId: string;
  enabled: boolean;
  displayKey: string;
  createdAt: string;
  updatedAt: string;
  lastRequest: string | null;
  status: ApiKeyStatus;
};

export type CreatedApiKeyView = ApiKeyView & {
  fullKey: string;
};

export type ApiKeyMutationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
