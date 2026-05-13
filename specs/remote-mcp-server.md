# Remote MCP Server — get-images-app

## Context

The architecture diagram (`PROMPTS & RESOURCES/ARCHITECTURE.png`) shows three entry points into the Next.js app: Web UI, REST API, and a **Remote MCP** server. The REST API and Web UI exist; the Remote MCP server is the missing piece.

The goal is a remote MCP server hosted as a Next.js route inside this same app that exposes the **same five capabilities** as the REST API to AI agents (Claude Desktop, Cursor, etc.). Auth is API-key Bearer tokens — **no OAuth** (per `auth-strategy` memory). The service layer (`runGeneration`, credits, DB queries) is reused — the MCP server is a thin transport adapter, not a separate stack.

User-confirmed choices:
- **Image return**: native MCP `image` content blocks (so agents can see the image) + structured metadata + a signed-URL `imageUrl` field in `structuredContent` (15-min TTL, HMAC-SHA256). Callers can save the image to disk via plain HTTP — closes the previous gap where bytes were only addressable via the MCP `image` content block. Keeps response context small (one short URL, no base64 inflation).
- **Adapter**: `mcp-handler` package (Vercel)
- **Endpoint path**: `/api/mcp`
- **Route timeout**: `maxDuration = 800` on both the Vercel function export AND the `mcp-handler` config option. The handler installs its own internal abort timer that defaults to **60 seconds** — without explicitly raising the handler's `maxDuration`, the response is aborted server-side at 60s even though the generation succeeds (image appears in dashboard, MCP call returns timeout). Vercel silently clamps to the active plan ceiling (Hobby 60s, Pro Standard 300s, Pro Fluid 800s, Enterprise 900s).
- **Progress notifications**: `generate_image` emits `notifications/progress` every 10s while waiting on the provider, keyed off the incoming request's `_meta.progressToken`. Resets per-tool-call timeouts on the client side (default 60s in many MCP clients).

---

## Tools Exposed (5)

All tools use the `getimages_` prefix and mirror the REST endpoints 1:1.

| Tool                          | REST equivalent               | Read-only | Notes                                        |
|-------------------------------|-------------------------------|-----------|----------------------------------------------|
| `getimages_generate_image`    | POST `/api/v1/images/generate`| no        | Charges credits. Returns MCP `image` block. |
| `getimages_list_images`       | GET `/api/v1/images`          | yes       | Paginated (limit, offset).                  |
| `getimages_get_image`         | GET `/api/v1/images/{id}`     | yes       | `includeBytes` flag returns MCP `image`.    |
| `getimages_get_account`       | GET `/api/v1/account`         | yes       | userId, email, creditBalance.               |
| `getimages_list_usage`        | GET `/api/v1/usage`           | yes       | Paginated credit transactions.              |

**Annotations** per MCP spec:
- `generate_image`: `readOnlyHint:false`, `destructiveHint:false`, `idempotentHint:false`, `openWorldHint:true`. Description must explicitly state credits are spent.
- Other four: `readOnlyHint:true`, `destructiveHint:false`, `idempotentHint:true`, `openWorldHint:true`.

---

## Architecture

```
src/app/api/mcp/
├── route.ts                    # Exports GET/POST/DELETE via mcp-handler + withMcpAuth (maxDuration = 800, both export + handler config)
└── files/[id]/route.ts         # GET — signed-URL image download endpoint (no bearer auth, sig in query)

src/lib/mcp/
├── server.ts                   # buildMcpServer() — registers all 5 tools on an McpServer
├── auth.ts                     # verifyToken adapter — wraps authenticateApiKey
├── format.ts                   # bytesToImageContent(), metadataToStructured()
├── signed-urls.ts              # sign/verify helpers (HMAC-SHA256, 15-min default TTL)
└── tools/
    ├── generate-image.ts       # tool definition + handler
    ├── list-images.ts
    ├── get-image.ts
    ├── get-account.ts
    └── list-usage.ts

src/services/
├── images/queries.ts           # listUserImages(), getUserImage()  (extracted)
├── account/queries.ts          # getAccountInfo()                  (extracted)
└── credits/queries.ts          # listCreditTransactions()          (extracted)
```

The MCP route is a sibling of `/api/v1/*` — same `runtime = "nodejs"`, same security headers from `next.config.ts`. No edge runtime. No streaming (stateless JSON mode).

---

## Critical Files

**Existing — reuse, do not modify (much):**
- `src/lib/api-key-auth.ts:22` — `authenticateApiKey(request)` is called inside the MCP auth verifier
- `src/services/image-generation/index.ts:110` — `runGeneration(userId, input)` is the single entry point for `generate_image`
- `src/services/image-generation/types.ts` — `RunGenerationInput`, `SUPPORTED_ASPECT_RATIOS`, `ThinkingLevel`
- `src/app/api/v1/_lib/generations.ts` — `generationMetadataSelection`, `toGenerationMetadata` (reuse for list/get tools)
- `src/app/api/v1/_lib/storage.ts` — `readImageBytes(imageUrl)` (reuse for get_image with bytes)
- `src/lib/schema.ts` — drizzle tables: `generation`, `creditBalance`, `creditTransaction`, `user`
- `src/lib/openapi.ts` — reference for tool descriptions / param documentation (mirror copy where useful)

**New files:**
- `src/app/api/mcp/route.ts`
- `src/app/api/mcp/files/[id]/route.ts` — signed-URL image download endpoint
- `src/lib/mcp/server.ts`, `auth.ts`, `format.ts`
- `src/lib/mcp/signed-urls.ts` — sign/verify helpers (HMAC-SHA256, 15-min default TTL)
- `src/lib/mcp/tools/{generate-image,list-images,get-image,get-account,list-usage}.ts`

**Service-layer extractions (small refactor — DRY with REST routes):**
- `src/services/images/queries.ts` — extract the query logic currently inline in `src/app/api/v1/images/route.ts:24-33` and `src/app/api/v1/images/[id]/route.ts:26-33`
- `src/services/account/queries.ts` — extract from `src/app/api/v1/account/route.ts:16-24`
- `src/services/credits/queries.ts` — extract from `src/app/api/v1/usage/route.ts:23-42`

Then update the four REST routes to call these helpers. This is the only refactor; it keeps both transports calling the same code paths.

**Dependency:**
- Add `mcp-handler` and `@modelcontextprotocol/sdk` to `package.json` (regular deps).

---

## Wiring Sketch (key code paths)

**`src/app/api/mcp/route.ts`** — entry point
```ts
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { buildMcpServer } from "@/lib/mcp/server";
import { verifyMcpToken } from "@/lib/mcp/auth";

export const runtime = "nodejs";

const baseHandler = createMcpHandler(
  (server) => buildMcpServer(server),
  {},
  { basePath: "/api" }
);

const handler = withMcpAuth(baseHandler, verifyMcpToken, { required: true });

export { handler as GET, handler as POST, handler as DELETE };
```

**`src/lib/mcp/auth.ts`** — bridges existing `authenticateApiKey`
```ts
export const verifyMcpToken = async (req: Request, _bearer?: string) => {
  const result = await authenticateApiKey(req);
  if (!result.ok) return undefined;  // 401 from mcp-handler
  return {
    token: _bearer ?? "",
    clientId: result.userId,
    scopes: [],
    extra: { userId: result.userId, keyId: result.keyId },
  };
};
```

Tool handlers read `extra.authInfo.extra.userId` to identify the caller.

**`src/lib/mcp/tools/generate-image.ts`** — example tool shape
```ts
server.registerTool(
  "getimages_generate_image",
  {
    title: "Generate an image",
    description: "<full description with model list, aspect ratios, thinking levels, credit cost warning>",
    inputSchema: { prompt, modelId, aspectRatio?, style?, thinkingLevel? },  // zod
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  async (params, { authInfo }) => {
    const userId = authInfo!.extra!.userId as string;
    try {
      const result = await runGeneration(userId, params);
      return {
        content: [
          { type: "image", data: result.bytes.toString("base64"), mimeType: result.mediaType },
          { type: "text", text: `Generated. Charged ${result.credits.charged} credits, ${result.credits.remaining} remaining. ID: ${result.image.id}` },
        ],
        structuredContent: {
          id: result.image.id,
          modelId: result.image.modelId,
          providerId: result.image.providerId,
          aspectRatio: result.image.aspectRatio,
          mediaType: result.mediaType,
          credits: result.credits,
          createdAt: result.image.createdAt,
        },
      };
    } catch (err) {
      return mcpErrorResult(err);  // handles ValidationError, InsufficientCreditsError, etc.
    }
  }
);
```

---

## Signed-URL design (image downloads)

Both `getimages_generate_image` and `getimages_get_image` include `imageUrl` in `structuredContent`. The URL points at `src/app/api/mcp/files/[id]/route.ts` and carries `sig` + `exp` in the query string.

- **Payload**: `${userId}:${imageId}:${exp}`. The `userId` is **not** in the URL — it's resolved from the DB at request time by looking up the image record by `id`, then verifying the HMAC against the resolved `userId`. This keeps the URL short and prevents URL-based user enumeration.
- **Algorithm**: HMAC-SHA256, base64url-encoded signature. Verified with `crypto.timingSafeEqual`.
- **Secret**: `MCP_FILE_SIGNING_SECRET` env var. The MCP route loud-fails on startup / first request if missing — no silent fallback.
- **TTL**: 900 seconds (15 minutes) default. Encoded in the URL as `exp` (unix seconds).
- **Failure modes**: bad signature, expired `exp`, unknown image id, image owned by a different user, and storage read errors all return `404` with a generic body. Never reveals whether the id exists or who owns it.
- **No bearer auth on this route.** The signature *is* the authorization. This lets callers hand the URL to any HTTP client (curl, WebFetch, browser preview) without leaking their API key.

---

## Non-functional / config

- **Route timeout**: `export const maxDuration = 800` on `src/app/api/mcp/route.ts`, AND `maxDuration: 800` in the `createMcpHandler` config (the handler's internal abort timer defaults to 60s — both must be raised). Vercel silently clamps to the active plan ceiling. Async/polling is a v2 follow-up if even 800s ever proves insufficient.
- **Progress notifications**: `generate_image` emits `notifications/progress` every 10s during long generations, keyed off `_meta.progressToken`. Keeps client-side tool-call timeouts (default ~60s) from firing while the provider is still working.
- **Prompt cap**: `generate_image`'s `prompt` input is capped at **8,000 characters** (raised from 2,000). The earlier 2,000 cap was easy to hit on detailed prompts.
- **Required env vars**: `MCP_FILE_SIGNING_SECRET` (signing) and `NEXT_PUBLIC_APP_URL` (absolute URL construction, with a request-derived fallback).

---

## Known Limitations (acceptable for v1)

1. **Rate-limit collapses to 401.** `withMcpAuth`'s `verifyToken` returns `AuthInfo | undefined` — there's no path to surface a 429 with `Retry-After`. Rate-limited keys appear as 401 in the MCP response. The REST API still returns 429 properly; only the MCP transport regresses here. Document in tool descriptions, revisit later if needed.

2. **No `b64_json` field in `structuredContent`.** Since the image is already in the MCP `image` content block, including the base64 again in `structuredContent` doubles context cost. `generate_image` and `get_image` (with `includeBytes:true`) return the bytes only in the `image` block.

3. **`destructiveHint:false` on `generate_image`.** Per MCP spec, "destructive" means the tool may destroy/modify existing resources. Spending credits creates a new resource and doesn't destroy data, so the hint is false — but the description must clearly warn agents that credits are spent (irreversible from a billing standpoint).

---

## Verification

After implementation:

1. **Build & typecheck**
   - `pnpm install`
   - `pnpm build` (Next.js build must pass with `strict` TS)
   - `pnpm lint`

2. **Local end-to-end with MCP Inspector**
   - Start dev server: `pnpm dev`
   - Run: `npx @modelcontextprotocol/inspector` and point it at `http://localhost:3000/api/mcp` with `Authorization: Bearer <test-api-key>` header
   - Verify the 5 tools list, schemas render, calling each tool returns expected content

3. **Auth checks**
   - Call `/api/mcp` with no `Authorization` header → 401
   - Call with an invalid key → 401
   - Call with a revoked key → 401
   - Call with a valid key → tools list returns

4. **Functional checks (per tool)**
   - `getimages_get_account` — returns the caller's email and balance
   - `getimages_list_images` (limit:5) — returns metadata for the most recent 5
   - `getimages_generate_image` — produces an image content block; balance drops by `creditCost`
   - `getimages_get_image` (id from previous call, `includeBytes:true`) — returns image block; (`includeBytes:false`) — metadata only
   - `getimages_list_usage` — shows the deduction transaction from the generate test

5. **Claude Desktop / Cursor smoke test**
   - Add a remote MCP server entry pointing at `https://<deploy-url>/api/mcp` with the test API key
   - Ask Claude "what's my credit balance on get-images?" — should call `getimages_get_account`
   - Ask Claude "generate an image of a red panda eating a popsicle" — should call `getimages_generate_image` and display the image
