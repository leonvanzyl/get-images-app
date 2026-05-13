# REST API v1 + API Key Management

## Context

The architecture diagram (`PROMPTS & RESOURCES/ARCHITECTURE.png`) defines three peer entry points sitting directly on a shared **Service Layer**:

1. **Web UI** — Next.js pages + Server Actions, authed by Better Auth session cookies. **Exists today.**
2. **REST API** — `app/api/v1/*` route handlers, authed by API key Bearer tokens. **Does NOT exist yet.**
3. **Remote MCP** — `app/api/mcp/*`. **Out of scope this PR.**

Currently the `/dashboard/keys` page is 100% mock — it generates fake key strings in the browser, stores them in `useState`, and is wiped on refresh. The `apikey` table doesn't exist. The CLI, Skill, MCP server, and direct API clients referenced in the architecture diagram have no way to authenticate.

**Goal:** ship real, DB-backed API key management *and* the `/api/v1/*` endpoints consumers will hit. A single auth mechanism — API key Bearer token — powers all non-browser entry points. The service layer (`generate()`, credit functions) is already transport-agnostic and accepts `userId`, so no service-layer changes are needed except a small refactor to expose raw bytes for inline base64 responses.

---

## Decisions

- **API keys via the official Better Auth `@better-auth/api-key` plugin** (not custom). Gives us hashed-secret storage, `lastRequest` tracking, per-key rate limits, expiration, revocation (`enabled=false`), and ready-made `auth.api.*` endpoints.
- **REST API scope: full v1 set** — `generate`, `account`, `usage`, `list`.
- **API key is the permanent auth scheme** for all non-browser entry points (REST API, Remote MCP, CLI, Skill, direct clients). **No OAuth, ever**, unless the product ever pivots to a third-party app marketplace (where a third party needs to act on behalf of a user). Industry precedent: Context7 (MCP), Vercel CLI, OpenAI, Anthropic, Stripe, Replicate — all API-key-first for developer use.
- **REST API returns images as inline base64 bytes** (`b64_json`), matching OpenAI's image API shape.

---

## Files to add

| File | Purpose |
|---|---|
| `src/lib/api-key-auth.ts` | `authenticateApiKey(request)` helper: parses `Authorization: Bearer …`, calls `auth.api.verifyApiKey`, returns `{ userId, keyId }` or a typed error |
| `src/app/dashboard/keys/actions.ts` | Server actions: `createApiKeyAction`, `listApiKeysAction`, `revokeApiKeyAction`, `deleteApiKeyAction` |
| `src/app/api/v1/images/generate/route.ts` | `POST` — generate an image (Bearer-authed) |
| `src/app/api/v1/images/route.ts` | `GET` — paginated list of the caller's past generations (metadata only, no bytes) |
| `src/app/api/v1/images/[id]/route.ts` | `GET` — single generation; returns metadata + `b64_json` (or `?format=metadata` for metadata only) |
| `src/app/api/v1/account/route.ts` | `GET` — `{ userId, email, creditBalance }` |
| `src/app/api/v1/usage/route.ts` | `GET` — paginated `creditTransaction` rows for the caller |

## Files to modify

| File | Change |
|---|---|
| `src/lib/auth.ts` | Add `apiKey({ rateLimit, …defaults })` plugin to the `plugins` array |
| `src/lib/auth-client.ts` | Add `apiKeyClient()` plugin |
| `src/lib/schema.ts` | Run `drizzle-kit generate` to pick up the new `apikey` table from the plugin (no manual edits) |
| `src/services/image-generation/index.ts` | Return `bytes: Buffer` and `mediaType: string` alongside `image` in `GenerateImageResult`. Web action ignores them; REST route base64-encodes them. Avoids a redundant re-fetch of the blob we just uploaded. |
| `src/services/image-generation/types.ts` | Add `bytes`/`mediaType` to `GenerateImageResult` |
| `src/app/dashboard/keys/page.tsx` | Convert to async server component that loads keys via `listApiKeysAction`; pass them to a small client subtree that handles create/revoke/delete via server actions. Drop `MOCK_KEYS` import. |
| `src/components/keys/create-key-dialog.tsx` | Call `createApiKeyAction(name)` instead of in-browser keygen. Two-step UX stays the same (name → reveal). Server returns the full key once. |
| `src/components/keys/key-table.tsx` | Accept a real key shape (mapped from `apikey` row) instead of `MockApiKey` |
| `src/components/keys/revoke-confirm-dialog.tsx`, `delete-confirm-dialog.tsx`, `empty-state.tsx` | Type swap from `MockApiKey` to the new shared type |
| `src/components/integrations/key-picker.tsx` | Same type swap |
| `src/app/dashboard/integrations/page.tsx` | Fetch active keys via `listApiKeysAction` instead of reading `MOCK_KEYS` |
| `src/lib/mock-data.ts` | Remove `MOCK_KEYS`, `MockApiKey`, `ApiKeyStatus`. Keep image mocks if still referenced elsewhere. |

---

## Key implementation details

### Better Auth api-key plugin

The plugin (verified by inspecting `@better-auth/api-key@1.6.11`'s type defs) provides an `apikey` table with: `name`, `start` (first chars for UI display), `prefix`, `key` (SHA-256 hashed), `referenceId` (userId), `enabled` (true=active / false=revoked), `lastRequest` (auto-updated on each verify — this is our `lastUsedAt`), `rateLimitMax` / `rateLimitTimeWindow` / `requestCount`, `expiresAt`, `permissions`, `metadata`, `createdAt`, `updatedAt`.

Plugin config:
```ts
apiKey({
  apiKeyHeaders: ["x-api-key", "authorization"],
  rateLimit: { enabled: true, timeWindow: 60_000, maxRequests: 60 },
  defaultPrefix: "gi_live_",
  startingCharactersConfig: { shouldStore: true, charactersLength: 8 },
})
```

The `start` field stores the first 8 chars, which the UI displays as the readable identifier (e.g., `gi_live_x9k4…`). The full secret is only returned by `auth.api.createApiKey` — never again.

### Bearer auth helper (`src/lib/api-key-auth.ts`)

```ts
type Result = { ok: true; userId: string; keyId: string } | { ok: false; status: 401 | 429; message: string }

export async function authenticateApiKey(req: Request): Promise<Result> {
  const header = req.headers.get("authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null
  if (!token) return { ok: false, status: 401, message: "Missing Bearer token" }
  const result = await auth.api.verifyApiKey({ body: { key: token } })
  if (!result.valid || !result.key) {
    const code = result.error?.code
    if (code === "RATE_LIMITED") return { ok: false, status: 429, message: "Rate limit exceeded" }
    return { ok: false, status: 401, message: "Invalid or revoked API key" }
  }
  return { ok: true, userId: result.key.userId, keyId: result.key.id }
}
```

Every `/api/v1/*` route's first line is `const auth = await authenticateApiKey(req); if (!auth.ok) return …`.

### `/api/v1/images/generate` response shape

```json
{
  "image": {
    "id": "0c7…uuid",
    "prompt": "a coral fish in a glass bowl",
    "modelId": "gemini-3-pro-image",
    "providerId": "google",
    "aspectRatio": "16:9",
    "mediaType": "image/png",
    "b64_json": "iVBORw0KGgoAAA…",
    "createdAt": "2026-05-13T09:14:22.001Z"
  },
  "credits": { "charged": 12, "remaining": 88 }
}
```

The route reuses `getBalance` → `deductCredit` → `generate()` → on error, `refundCredit`. Same flow as `generateImageAction`; the only differences are auth (API key vs session) and response shape (base64 vs URL). To avoid duplicating that orchestration, extract a tiny service helper `runGeneration(userId, input)` in `src/services/image-generation/index.ts` that both `generateImageAction` and the REST route call. Keeps logic in one place, transport-agnostic — exactly what the architecture diagram's Service Layer prescribes.

### Schema migration

After the plugin is added, run:
```
pnpm run db:generate
pnpm run db:migrate
```
Per `AGENTS.md`: never `db:push`. The generated migration goes in `drizzle/0006_…sql`. Review the diff before running migrate.

### Mapping plugin fields → existing UI

| UI field (`MockApiKey`) | DB field | Notes |
|---|---|---|
| `id` | `apikey.id` | passthrough |
| `name` | `apikey.name` | passthrough |
| `prefix` (masked display) | derived from `apikey.prefix` + `apikey.start` | Display as `${prefix}${start}••••••`. The current mock's "tail 4 chars" is cosmetic; dropping it is fine since the plugin doesn't store them. |
| `status: "active" \| "revoked"` | `apikey.enabled` | `enabled=true ⇒ "active"` |
| `createdAt` | `apikey.createdAt` | passthrough |
| `lastUsedAt` | `apikey.lastRequest` | passthrough, nullable |
| `fullKey` (creation-only) | `result.key` from `createApiKey` | only present in create response |

---

## Rate limiting

The api-key plugin enforces per-key rate limits natively (`requestCount` against `rateLimitMax` within `rateLimitTimeWindow`). Default: **60 requests / minute** per key — plenty for a CLI or single MCP client. Power users can be raised individually later via `updateApiKey`. The existing in-memory limiter in `src/lib/rate-limit.ts` is untouched.

---

## Out of scope (this PR)

- Remote MCP route at `/api/mcp/tools/*` — will reuse the same `authenticateApiKey` helper when built
- Discovery endpoints `/openapi.json`, `/.skill.txt`
- Per-key permissions / scopes (treat all v1 keys as full account access)
- CLI tool / npm package
- Library filtering and search via REST (only paginated list in this PR)

None of these are blocked by decisions in this PR.

---

## Verification

1. **Static checks**
   - `pnpm run check` (lint + typecheck) passes
2. **Migration**
   - `pnpm run db:generate` produces a migration adding the `apikey` table
   - Inspect the generated SQL before running
   - `pnpm run db:migrate` succeeds against local PostgreSQL
3. **UI smoke test (manual)**
   - `pnpm run dev`, sign in, visit `/dashboard/keys`
   - Click **New key**, enter a name → full secret shown exactly once, copy button works, "I've saved it" gating still in place
   - Refresh the page → key persists, full secret is **not** shown again, only the masked prefix
   - Click **Revoke** → row shows revoked state; refresh confirms persistence
   - Click **Delete** on the revoked row → it disappears; refresh confirms
   - `/dashboard/integrations` shows the same real keys in the picker
4. **REST smoke test (manual, via curl)**
   - Save the full key from step 3 as `$KEY`
   - `curl -H "Authorization: Bearer $KEY" http://localhost:3000/api/v1/account` → 200 with `{ userId, email, creditBalance }`
   - `curl -X POST -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"prompt":"a coral fish","modelId":"gemini-2.5-flash-image","aspectRatio":"1:1"}' http://localhost:3000/api/v1/images/generate` → 200, response contains `b64_json` field, balance decreases
   - Decode the base64 to a file and verify it's a valid PNG
   - Same `POST` without `Authorization` → 401
   - Revoke the key in the UI, retry → 401
   - `curl …/api/v1/images?limit=5` → 200 with `{ images: [...], total, limit, offset }`
   - `curl …/api/v1/usage?limit=10` → 200 with recent credit transactions including the deduction from the generate call above
5. **Rate limit check**
   - Hit `/api/v1/account` 70 times in a minute with the same key → at least one 429 response with `Retry-After`
