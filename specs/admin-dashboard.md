# Admin Dashboard

## Context

The platform owner currently has no in-app way to operate Get Images. To change a
model's credit cost they edit Postgres directly; to suspend a user they would
have to write SQL; there is no view of platform-wide usage, revenue, or
credit flow. As the user base grows this becomes painful and risky.

This plan adds a dedicated `/admin` section, gated by Better Auth's official
admin plugin, that exposes the operator surface the owner needs:

- Overview KPIs (users, generations, credits, revenue)
- Full user management (search, ban, role change, credit adjust, impersonate)
- Full model registry CRUD (replacing the hardcoded `IMAGE_MODELS` list)
- Global transaction & audit log views

A first admin is bootstrapped from an `ADMIN_EMAILS` env var, so the system
self-heals after fresh deploys without manual SQL.

## Architectural decisions (confirmed with user)

1. **Better Auth `admin` plugin** for roles, ban, impersonation
2. **`/admin` top-level route** with its own layout & sidebar (not under `/dashboard`)
3. **Fully DB-driven model registry** — replace the hardcoded `IMAGE_MODELS` array with a `model` table
4. **`ADMIN_EMAILS` env var** bootstrap via a database hook
5. **Dedicated `admin_audit_log` table** for accountability
6. **Impersonation exposed in the UI** with a global red banner while active
7. **Overview KPIs:** user stats, generation stats, credit/revenue stats, top users

---

## Phase 1 — Schema changes (single Drizzle migration)

Edit `src/lib/schema.ts`. Generate + migrate with:

```
pnpm db:generate    # creates drizzle/0007_*.sql
pnpm db:migrate
```

`db:push` is forbidden (AGENTS.md).

### 1a. Extend `user` (Better Auth admin plugin columns)

Add to the existing `user` pgTable:

```ts
role: text("role").default("user"),
banned: boolean("banned").default(false),
banReason: text("ban_reason"),
banExpires: timestamp("ban_expires"),
```

### 1b. Replace `modelPricing` with new `model` table

Drop `model_pricing`. Add `model`:

| Column                    | Type          | Null | Default               | Notes                                       |
|---------------------------|---------------|------|-----------------------|---------------------------------------------|
| `id`                      | uuid          | no   | `gen_random_uuid()`   | PK                                          |
| `modelId`                 | text          | no   | —                     | Composite key, e.g. `openai:gpt-image-1.5`. Unique index. |
| `providerId`              | text          | no   | —                     | `openai` / `google` — validated by Zod allowlist |
| `providerModelId`         | text          | no   | —                     | SDK-facing id, e.g. `gpt-image-1.5`         |
| `name`                    | text          | no   | —                     | Display name                                |
| `description`             | text          | no   | —                     | UI subtitle                                 |
| `aspectRatios`            | `text[]`      | no   | —                     | Postgres native array via Drizzle `.array()` |
| `thinkingDefault`         | text          | yes  | null                  | `minimal` \| `low`                          |
| `thinkingHigh`            | text          | yes  | null                  | `high` (null = no thinking support)         |
| `creditCost`              | integer       | no   | —                     | Base cost                                   |
| `thinkingHighCreditCost`  | integer       | yes  | null                  | Surcharge for deep thinking                 |
| `isActive`                | boolean       | no   | `true`                | Hidden from listings when false             |
| `sortOrder`               | integer       | no   | `0`                   | UI ordering                                 |
| `createdAt`/`updatedAt`   | timestamp     | no   | `now()`               |                                             |

Indexes:
- `uniqueIndex("model_model_id_idx").on(modelId)`
- `index("model_is_active_sort_idx").on(isActive, sortOrder)`

After `pnpm db:generate`, hand-add this CHECK constraint to the generated SQL
file:

```sql
ALTER TABLE "model" ADD CONSTRAINT "model_thinking_both_or_neither"
  CHECK ((thinking_default IS NULL) = (thinking_high IS NULL));
```

### 1c. New `admin_audit_log` table

```ts
adminAuditLog: pgTable("admin_audit_log", {
  id: uuid().defaultRandom().primaryKey(),
  actorId: text("actor_id").notNull().references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("admin_audit_log_actor_id_idx").on(t.actorId),
  index("admin_audit_log_action_idx").on(t.action),
  index("admin_audit_log_target_idx").on(t.targetType, t.targetId),
  index("admin_audit_log_created_at_idx").on(t.createdAt),
])
```

### 1d. Seed script

Replace `scripts/seed-model-pricing.ts` with **`scripts/seed-models.ts`**.
Idempotent upsert of the 5 existing models with full metadata
(aspectRatios, thinking config, cost, sortOrder). Add
`"db:seed-models": "npx tsx --env-file .env scripts/seed-models.ts"` to
`package.json`. Drop the old `db:seed-pricing` script.

---

## Phase 2 — Model registry code refactor

Replace hardcoded models with DB reads. **All three things below ship in one
commit** — `model_pricing` is dropped in the same migration, so the credits
service and seed script must move together.

### 2a. New `src/services/image-generation/model-repository.ts`

Owns all DB access for models. Every exported function is wrapped in
`React.cache()` so a single request only hits Postgres once per model.

Exports:
- `listModels(opts?: { onlyConfigured?: boolean }): Promise<ImageModelDefinition[]>`
- `getModel(modelId: string): Promise<ImageModelDefinition | null>`
- `loadAllModels()` — includes inactive (for admin)
- `loadModelPricing(modelId)` — for `services/credits`
- `loadAllPricing()` — for pricing page

Internal `rowToDefinition(row)` maps DB row to existing `ImageModelDefinition`
TS shape (keep the type as the in-memory contract).

`onlyConfigured` filtering moves here:
```ts
const PROVIDER_ENV_KEYS = { openai: "OPENAI_API_KEY", google: "GOOGLE_GENERATIVE_AI_API_KEY" };
```

### 2b. Delete `src/services/image-generation/models.ts`

Replaced by `model-repository.ts`. `src/services/image-generation/index.ts`
re-exports `getModel`/`listModels` from the new module.

### 2c. Sync → async call-site updates

| File | Change |
|---|---|
| `src/services/image-generation/index.ts` | `generate()` and `validateGenerationRequest()` `await getModel(...)`; `validateGenerationRequest` becomes async |
| `src/services/image-generation/providers/google.ts` | Stop fetching the model inside the provider. Refactor `callProvider` to pass `thinkingApiValue` from already-loaded `modelDef` in `runGeneration` |
| `src/services/credits/index.ts` | `getModelCreditCost` & `getAllModelPricing` rewritten to read from `model` table; drop the `modelPricing` import |
| `src/app/dashboard/actions.ts` | `await listModels({ onlyConfigured: true })` |
| `src/components/library/image-lightbox.tsx` | **Client component — can't await DB.** Pass `modelName` from server via `getLibraryImagesAction`; drop the `IMAGE_MODELS` import. Add `modelName` field to `LibraryImage` |
| `src/lib/openapi.ts` | `getOpenApiDocument()` becomes async; call site (`/api/v1/openapi` route) already async |
| `src/lib/mcp/tools/generate-image.ts` | `registerGenerateImageTool` becomes async; `await loadActiveModels()` before building the tool description |
| `src/app/(site)/pricing/page.tsx` | Single `await loadActiveModels()` — drop the merge with separate pricing rows; new `model` table holds both |

### 2d. Validation for admin writes

In `src/services/image-generation/types.ts`, export
`SUPPORTED_PROVIDERS = ["openai", "google"] as const`. Admin actions use a
Zod schema with:
- `providerId: z.enum(SUPPORTED_PROVIDERS)`
- `modelId.regex(/^[a-z]+:[a-z0-9.\-]+$/)`
- `.refine(v => v.modelId.startsWith(v.providerId + ":"))`
- `.refine(v => (v.thinkingDefault === null) === (v.thinkingHigh === null))`

DB has matching CHECK + unique constraints (belt + braces). No `provider_id`
CHECK in the DB — Zod allowlist is the right enforcement point.

### 2e. Historical generations remain safe

`generation.modelId` is a text column with no FK. Disabling or deleting a
model row never breaks `/library` or history pages — the model-name lookup
falls back to the raw composite id (already the pattern in
`image-lightbox.tsx`). Soft-delete (toggle `isActive`) is preferred; the
admin "Hard delete" path refuses if any `generation` row references the id.

---

## Phase 3 — Auth wiring

### 3a. `src/lib/auth.tsx`

Add the admin plugin and two `databaseHooks`:

```ts
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { isBootstrapAdminEmail } from "./admin-emails";

plugins: [
  apiKey({ /* unchanged */ }),
  adminPlugin(),                       // defaults are fine; 1h impersonation duration
  polar({ /* unchanged */ }),
],
databaseHooks: {
  user: {
    create: {
      before: async (u) => {
        if (isBootstrapAdminEmail(u.email)) return { data: { ...u, role: "admin" } };
        return { data: u };
      },
    },
  },
  session: {
    create: {
      after: async (s) => {
        // Promote pre-existing users whose email is now in ADMIN_EMAILS.
        const [row] = await db
          .select({ email: user.email, role: user.role })
          .from(user)
          .where(eq(user.id, s.userId))
          .limit(1);
        if (row && isBootstrapAdminEmail(row.email) && row.role !== "admin") {
          await db.update(user)
            .set({ role: "admin", updatedAt: new Date() })
            .where(eq(user.id, s.userId));
        }
      },
    },
  },
},
```

### 3b. `src/lib/auth-client.ts`

Add `adminClient()` plugin to the client `plugins` array.

### 3c. `src/lib/admin-emails.ts` (new)

Cached `Set<string>` from `process.env.ADMIN_EMAILS` (comma-separated,
lower-cased, trimmed). `isBootstrapAdminEmail(email)` helper.

Add `ADMIN_EMAILS` to `.env.example` and `src/lib/env.ts` (if env validation
exists).

### 3d. `src/lib/admin-session.ts` (new)

```ts
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/dashboard");
  return session;
}
export async function isAdmin() { /* same shape, returns boolean */ }
```

Append `/admin` to `protectedRoutes` in `src/lib/session.ts` so the proxy
redirects unauthenticated users at the edge.

---

## Phase 4 — Admin section UI

### 4a. Route tree

```
src/app/admin/
├── layout.tsx                       # requireAdmin(); render <AdminChrome>
├── page.tsx                         # Overview
├── loading.tsx                      # skeletons
├── users/
│   ├── page.tsx                     # List + filters + bulk actions
│   ├── actions.ts                   # all user mutations + adjustCreditsAction
│   └── [userId]/page.tsx            # User detail
├── models/
│   ├── page.tsx                     # Registry list + dialogs
│   └── actions.ts                   # create/update/delete/toggle
├── credits/
│   └── actions.ts                   # re-exports adjustCreditsAction
├── transactions/page.tsx            # Global credit_transaction list
└── audit/page.tsx                   # admin_audit_log viewer
```

### 4b. Chrome

- `src/app/admin/layout.tsx`: server component, calls `await requireAdmin()`,
  detects `session.session.impersonatedBy` and forwards `isImpersonating` to
  the chrome.
- `src/components/admin/admin-chrome.tsx`: mirrors
  `src/components/dashboard/dashboard-chrome.tsx` — 240px sticky sidebar at
  `md+`, mobile sheet. Wordmark: `get images / admin` with the `admin`
  segment in `text-destructive`.
- `src/components/admin/admin-sidebar.tsx`: same visual treatment as
  `dashboard-sidebar.tsx` (active state `bg-primary/10 text-primary`).
  Replaces the credit-balance footer with a "Back to dashboard" link +
  admin avatar dropdown (Profile / Theme / Sign out).

Nav items:

| Path                  | Label        | Icon              |
|-----------------------|--------------|-------------------|
| `/admin`              | Overview     | `LayoutDashboard` |
| `/admin/users`        | Users        | `Users`           |
| `/admin/models`       | Models       | `Boxes`           |
| `/admin/transactions` | Transactions | `Coins`           |
| `/admin/audit`        | Audit log    | `ScrollText`      |
| `/dashboard`          | Back to dashboard | `ArrowLeft`  |

### 4c. Impersonation banner

Rendered by **both** `AdminChrome` and `DashboardChrome` (impersonation
typically lands the admin into `/dashboard` as the target). Sticky strip,
`bg-destructive text-destructive-foreground`, text "Impersonating as <name>
· <email>", with a "Stop impersonating" button calling
`stopImpersonatingAction` then `router.replace("/admin/users")`.

`dashboard-chrome.tsx` extension: `dashboard/layout.tsx` already fetches
session — compute `isImpersonating = Boolean(session.session.impersonatedBy)`
and forward as a prop.

### 4d. Per-page spec (concise)

All pages use the existing header pattern
(`<header className="mb-10 flex items-end justify-between gap-4">` with
`<h1 className="font-display text-3xl font-medium tracking-tight">`) and
page wrapper `px-8 py-10 md:px-12 md:py-12`.

Shared query helpers live in **`src/services/admin/queries.ts`**.

**Overview** (`/admin`)
- Parallel queries via `Promise.all`: `getUserStats`, `getGenerationStats`,
  `getCreditStats`, `getTopUsersByGenerations({ days: 30, limit: 10 })`,
  `getRecentAuditEvents({ limit: 10 })`
- 3-up `Card` grid of KPIs, two-column section below (Top users table +
  Recent admin activity)

**Users list** (`/admin/users`)
- `listUsersForAdmin({ search, role, banned, sort, page })` returns rows
  joined to `credit_balance` (left) and a `generation` count subquery
- Search via URL `?q=`, filter chips, shadcn `Table`, per-row `DropdownMenu`
  with: View, Adjust credits, Set role, Ban/Unban, Impersonate, Remove
- Pagination via `searchParams`
- Dialogs in `src/components/admin/`: `adjust-credits-dialog.tsx`,
  `set-role-dialog.tsx`, `ban-user-dialog.tsx`, `remove-user-dialog.tsx`
  (all plain `useState`, no react-hook-form)

**User detail** (`/admin/users/[userId]`)
- `getUserDetail(userId)` returns profile + balance + last 20 generations +
  last 20 transactions + audit events targeting this user + active session count
- Profile card, generations table (thumbnail + prompt + model + cost),
  transactions table (colorized amount), audit events table
- Action buttons in header: Adjust credits, Set role, Ban/Unban, Impersonate,
  Remove

**Models** (`/admin/models`)
- `listModelsForAdmin()` returns all rows (active + inactive) ordered by
  `sortOrder`
- Table: ID (mono), Name, Provider, Aspect ratios (pill list), Base cost,
  Deep cost, Thinking support, Active toggle, Actions
- "New model" button + edit dialog (`model-form-dialog.tsx`), fields per
  the Zod schema in §2d. Provider select sourced from `SUPPORTED_PROVIDERS`
- Active toggle = inline button calling `toggleModelActiveAction`
- Delete = soft (toggle inactive) or hard with the "no historical references"
  guard

**Transactions** (`/admin/transactions`)
- `listAllCreditTransactions({ userId?, type?, from?, to?, page })` joins to
  `user` for display
- Filter row (user search, type select, date range), table, pagination

**Audit log** (`/admin/audit`)
- `listAuditLog({ actorId?, action?, targetType?, targetId?, from?, to?, page })`
  joins to `user` twice (actor + target where applicable)
- Filter row, table with "View JSON" cell opening a dialog showing
  before/after diff

### 4e. Server actions

All start with `"use server"`, call `await requireAdmin()`, parse with Zod,
mutate, write audit row, `revalidatePath()`, return `{ success, data/error }`.

**`src/app/admin/users/actions.ts`:**
- `setRoleAction({ userId, role })` — forbids self-demotion
- `banUserAction({ userId, banReason, banExpiresIn? })` — forbids self-ban
- `unbanUserAction({ userId })`
- `removeUserAction({ userId })` — forbids self-remove
- `impersonateUserAction({ userId })` — forbids self; calls
  `auth.api.impersonateUser`; UI then `router.replace("/dashboard")`
- `stopImpersonatingAction()` — calls `auth.api.stopImpersonating`
- `adjustCreditsAction({ userId, amount, reason })` — atomic transaction
  (see §4f)

**`src/app/admin/models/actions.ts`:**
- `createModelAction(modelInsertSchema)` — Zod-validated, catches unique
  violation
- `updateModelAction({ id, ...fields })` — `modelId` immutable
- `deleteModelAction({ id, force? })` — soft by default; `force` refuses
  if any `generation` references the model
- `toggleModelActiveAction({ id, isActive })`

Each one revalidates `/admin/models`, `/dashboard`, `/pricing`.

**`src/app/admin/credits/actions.ts`:** thin re-export of
`adjustCreditsAction` so callers can import from `/admin/credits/...`.

### 4f. Atomic credit adjustment

`adjustCreditsAction` body:

```ts
await db.transaction(async (tx) => {
  // 1. Lock balance row.
  const rows = await tx.execute(
    sql`SELECT balance FROM credit_balance WHERE user_id = ${userId} FOR UPDATE`
  );
  const prev = (rows[0] as { balance: number } | undefined)?.balance ?? 0;
  const next = prev + amount;
  if (next < 0) throw new Error("Adjustment would result in a negative balance.");

  // 2. Upsert balance.
  await tx.insert(creditBalance).values({ userId, balance: next })
    .onConflictDoUpdate({ target: creditBalance.userId, set: { balance: next, updatedAt: new Date() } });

  // 3. Transaction row.
  await tx.insert(creditTransaction).values({
    userId, amount, type: "admin_adjustment", description: reason, referenceId: null,
  });

  // 4. Audit row (atomic with the credit move).
  await tx.insert(adminAuditLog).values({
    actorId: getActorId(session),  // see §4g
    action: "user.adjust_credits",
    targetType: "user", targetId: userId,
    before: { balance: prev },
    after: { balance: next, delta: amount },
    notes: reason,
  });
});
```

`FOR UPDATE` matches the existing `deductCredit` lock pattern in
`src/services/credits/index.ts` — solves concurrent-edit races.

### 4g. Audit helper

`src/services/admin/audit.ts`:

```ts
export type AdminAuditAction =
  | "user.set_role" | "user.ban" | "user.unban" | "user.remove"
  | "user.impersonate" | "user.stop_impersonate" | "user.adjust_credits"
  | "model.create" | "model.update" | "model.delete" | "model.toggle_active";

export function getActorId(session): string {
  // While impersonating, session.user.id is the *target*. The real actor is impersonatedBy.
  return session.session.impersonatedBy ?? session.user.id;
}

export async function writeAuditLog(input: {
  actorId: string; action: AdminAuditAction;
  targetType: "user" | "model" | "credit_balance" | null;
  targetId: string | null; before?: unknown; after?: unknown; notes?: string;
}): Promise<void>;
```

Audit writes outside the credit-adjustment path are best-effort (log
failures, don't roll back the business action). The credit path is the
exception — it's atomic in one transaction.

### 4h. Edge-case guards

- **Self-demote / self-ban / self-remove / self-impersonate** rejected
  server-side in each action (UI also hides the menu items, but server is
  authoritative)
- **Concurrent credit edits** — `FOR UPDATE` lock + `next < 0` check
- **Audit during impersonation** — `getActorId` reads
  `session.session.impersonatedBy` so the *real* admin is recorded

---

## Critical files (created or modified)

**Schema & migrations**
- `src/lib/schema.ts` — extend `user`, add `model`, add `adminAuditLog`, drop `modelPricing`
- `drizzle/0007_*.sql` (generated) — hand-add the CHECK constraint
- `scripts/seed-models.ts` (new) — replaces `scripts/seed-model-pricing.ts`
- `package.json` — add `db:seed-models`, drop `db:seed-pricing`
- `.env.example`, `src/lib/env.ts` — add `ADMIN_EMAILS`

**Auth**
- `src/lib/auth.tsx` — add `adminPlugin`, `databaseHooks`
- `src/lib/auth-client.ts` — add `adminClient()`
- `src/lib/admin-emails.ts` (new), `src/lib/admin-session.ts` (new)
- `src/lib/session.ts` — append `/admin` to `protectedRoutes`

**Model registry refactor**
- `src/services/image-generation/model-repository.ts` (new)
- `src/services/image-generation/models.ts` — **delete**
- `src/services/image-generation/index.ts` — re-exports, async `getModel`
- `src/services/image-generation/providers/google.ts` — accept resolved thinking value
- `src/services/image-generation/types.ts` — export `SUPPORTED_PROVIDERS`
- `src/services/credits/index.ts` — read from `model` table
- `src/app/dashboard/actions.ts` — await `listModels`
- `src/components/library/image-lightbox.tsx` — receive `modelName` prop
- `src/lib/openapi.ts` — async `getOpenApiDocument`
- `src/lib/mcp/tools/generate-image.ts` — async tool registration
- `src/app/(site)/pricing/page.tsx` — single `loadActiveModels` call

**Admin section**
- `src/app/admin/layout.tsx`, `loading.tsx`, `page.tsx` (overview)
- `src/app/admin/users/{page.tsx, [userId]/page.tsx, actions.ts}`
- `src/app/admin/models/{page.tsx, actions.ts}`
- `src/app/admin/credits/actions.ts`
- `src/app/admin/transactions/page.tsx`
- `src/app/admin/audit/page.tsx`
- `src/components/admin/{admin-chrome.tsx, admin-sidebar.tsx, adjust-credits-dialog.tsx, set-role-dialog.tsx, ban-user-dialog.tsx, remove-user-dialog.tsx, model-form-dialog.tsx, delete-confirm-dialog.tsx, impersonation-banner.tsx}`
- `src/components/dashboard/dashboard-chrome.tsx` — render impersonation banner
- `src/services/admin/{queries.ts, audit.ts}` (new)

---

## Implementation sequence (parallel-friendly)

The user's AGENTS.md says to delegate to sub-agents and parallelize where
possible. Suggested wave layout:

**Wave 1 — Schema & auth foundations (sequential, one PR-sized task):**
1. Extend `user`, add `model`, add `admin_audit_log`, drop `modelPricing`
2. `pnpm db:generate` + add CHECK + `pnpm db:migrate`
3. `scripts/seed-models.ts` + `pnpm db:seed-models`
4. `src/lib/admin-emails.ts`, `src/lib/admin-session.ts`
5. Wire admin plugin + databaseHooks in `auth.tsx` and `auth-client.ts`
6. Append `/admin` to `protectedRoutes`

**Wave 2 — Model registry refactor (parallel sub-agents):**
- 2a. `model-repository.ts` + delete `models.ts` + update `image-generation/index.ts` and `providers/google.ts`
- 2b. Rewrite `services/credits/index.ts` to read from `model`
- 2c. Update consumers: dashboard actions, lightbox prop, pricing page, openapi, mcp tool

**Wave 3 — Admin chrome & shared services (parallel):**
- 3a. `admin/layout.tsx`, `AdminChrome`, `AdminSidebar`, `ImpersonationBanner`
  (+ wire banner into `dashboard-chrome.tsx`)
- 3b. `services/admin/queries.ts`, `services/admin/audit.ts`

**Wave 4 — Admin pages & actions (parallel sub-agents, one per area):**
- 4a. Overview page
- 4b. Users list + detail + actions + dialogs
- 4c. Models list + actions + form dialog
- 4d. Transactions page
- 4e. Audit log page

After every wave: `pnpm lint && pnpm typecheck && pnpm build` (and any unit
tests that exist).

---

## Verification

Once implemented, the following manual + scripted checks confirm the system
works end-to-end. The user can run them directly, or delegate to a Playwright
sub-agent (skill available).

1. **Bootstrap**
   - Set `ADMIN_EMAILS=leon.vanzyl@gmail.com` in `.env`
   - Sign in. Hit `/admin` directly — should load (no 302 to `/dashboard`)
   - `SELECT role FROM "user" WHERE email = 'leon.vanzyl@gmail.com'` → `admin`

2. **Non-admin access**
   - Sign in as a second test user (not in `ADMIN_EMAILS`)
   - Hit `/admin` → redirected to `/dashboard`
   - Hit `/admin/users` → redirected to `/dashboard`

3. **Models registry parity**
   - `/admin/models` shows the 5 seeded models with correct base + deep costs
   - Generate an image as a normal user (existing flow at `/dashboard`)
   - Image generates successfully; credits deduct per the seeded cost
   - `/pricing` shows the same models with the same costs

4. **Model CRUD**
   - Edit `creditCost` on `openai:gpt-image-1.5` to 7 via admin
   - Generate an image with that model — 7 credits deducted, transaction row created
   - Toggle the model inactive — it disappears from `/dashboard` and `/pricing`
   - Past `/library` entries for that model still render (text fallback)
   - Try to hard-delete it — refused because `generation` references exist
   - Try to create a model with `providerId: "midjourney"` — Zod rejects

5. **User management**
   - Adjust 10 credits onto the test user → balance updates, transaction row
     with type `admin_adjustment`, audit row with `before`/`after` JSON
   - Ban the test user with a reason → on next page load they're signed out;
     `banned = true`, `banReason` populated
   - Unban → user can sign in again
   - Promote the test user to admin → they can now reach `/admin`
   - Demote them back to `user`

6. **Impersonation**
   - Click "Impersonate" on the test user from `/admin/users`
   - Land in `/dashboard` as them; red "Impersonating as ..." banner visible
   - Click "Stop impersonating" → back at `/admin/users`, banner gone
   - Audit log contains `user.impersonate` followed by `user.stop_impersonate`

7. **Audit log**
   - `/admin/audit` lists every action above with correct actor (and the
     real admin id during impersonated mutations, not the impersonated user)

8. **Self-action guards**
   - From `/admin/users`, attempt to set own role to `user` → error
   - Attempt to ban self → error

9. **Quality gates**
   - `pnpm lint` clean
   - `pnpm typecheck` (or `pnpm build`) clean
