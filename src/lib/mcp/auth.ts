import { authenticateApiKey } from "@/lib/api-key-auth";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

/**
 * Bridges the existing API-key auth to mcp-handler's `verifyToken` contract.
 *
 * mcp-handler's `withMcpAuth` only understands `AuthInfo | undefined` —
 * returning `undefined` causes a 401. Rate-limited responses (429) from
 * `authenticateApiKey` collapse to 401 here; this is a documented v1
 * limitation (the REST transport still returns proper 429s).
 */
export async function verifyMcpToken(
  req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  const result = await authenticateApiKey(req);
  if (!result.ok) {
    return undefined;
  }

  return {
    token: bearerToken ?? "",
    clientId: result.userId,
    scopes: [],
    extra: { userId: result.userId, keyId: result.keyId },
  };
}
