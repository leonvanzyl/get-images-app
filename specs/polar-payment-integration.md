# Polar.sh Payment Integration Plan

## Context

The app has a credit-based system with variable per-model pricing (just implemented). The pricing page shows three credit packs (Starter/Plus/Pro) with disabled "Coming Soon" buttons. The user has created matching products in Polar.sh (sandbox) and wants to wire up real checkout so users can buy credit packs. BetterAuth already handles auth — Polar has a first-party BetterAuth plugin (`@polar-sh/better-auth`) that provides checkout, portal, and webhook handling.

**Goal:** Users click "Buy" on the pricing page, complete checkout via Polar, and credits are automatically added to their balance via webhook.

---

## Step 1: Install dependencies

```
pnpm add @polar-sh/sdk @polar-sh/better-auth
```

---

## Step 2: Update credit service — add `referenceId` + idempotency

**File:** `src/services/credits/index.ts`

- Add optional `referenceId?: string` parameter to `addCredits()`
- Inside the transaction, before upserting: if `referenceId` is provided, check if a `creditTransaction` with that `referenceId` already exists — if so, return early (prevents duplicate credits from webhook retries)
- Pass `referenceId` to the `creditTransaction` insert

---

## Step 3: Update BetterAuth server config

**File:** `src/lib/auth.ts`

- Import `Polar` from `@polar-sh/sdk`
- Import `polar`, `checkout`, `webhooks` from `@polar-sh/better-auth`
- Import `addCredits` from `@/services/credits`
- Create Polar SDK client with `server: "sandbox"`
- Define product-to-credits mapping:
  ```
  Starter  3ac91063-0b4f-4797-a912-e04077effe45 → 100 credits
  Plus     3bee32d8-0a90-4de1-8e2f-5494b34def09 → 500 credits
  Pro      c305fae8-29c5-437d-baa8-22b66bbb28ad → 1,200 credits
  ```
- Add `polar()` plugin to the BetterAuth config with:
  - `createCustomerOnSignUp: true`
  - `checkout()` sub-plugin with product slugs (`starter`, `plus`, `pro`), `successUrl: "/dashboard"`, `authenticatedUsersOnly: true`
  - `webhooks()` sub-plugin with `onOrderPaid` handler that:
    1. Gets user ID from `payload.data.customer.externalId`
    2. Maps product ID to credit amount
    3. Calls `addCredits(userId, credits, description, orderId)`

---

## Step 4: Update BetterAuth client config

**File:** `src/lib/auth-client.ts`

- Import `polarClient` from `@polar-sh/better-auth/client`
- Add `plugins: [polarClient()]` to `createAuthClient`
- This adds `authClient.checkout()` method for initiating checkout from the browser

---

## Step 5: Create CheckoutButton client component

**New file:** `src/components/pricing/checkout-button.tsx`

- `"use client"` component
- Props: `slug: string` (matches checkout product slug)
- Uses `useSession` to check auth state
- On click: if not authenticated → redirect to `/login`; if authenticated → call `authClient.checkout({ slug })`
- Shows loading state while redirecting
- Follows Neo-Cinema Dark design system (monospaced uppercase label, `border-border/60`, hover states)

---

## Step 6: Wire up pricing page

**File:** `src/app/(site)/pricing/page.tsx`

- Add `slug` field to each `CREDIT_PACKS` entry (`"starter"`, `"plus"`, `"pro"`)
- Import `CheckoutButton`
- Replace the disabled `<button>Coming Soon</button>` with `<CheckoutButton slug={pack.slug} />`
- Page stays as a Server Component — only the button is a Client Component

---

## Files summary

| Action | File |
|--------|------|
| Modify | `src/services/credits/index.ts` — referenceId + idempotency |
| Modify | `src/lib/auth.ts` — Polar plugin + webhook handler |
| Modify | `src/lib/auth-client.ts` — Polar client plugin |
| Create | `src/components/pricing/checkout-button.tsx` — checkout button |
| Modify | `src/app/(site)/pricing/page.tsx` — wire buttons |
| Modify | `package.json` — new dependencies (via pnpm add) |

---

## Verification

1. **Install:** `pnpm add @polar-sh/sdk @polar-sh/better-auth` succeeds
2. **Build:** `pnpm lint && pnpm typecheck` pass
3. **Dev server:** `pnpm dev` starts without errors
4. **Pricing page:** Visit `/pricing` — buttons now say "Buy X credits" instead of "Coming Soon"
5. **Unauthenticated click:** Clicking a button while logged out redirects to `/login`
6. **Authenticated checkout:** Clicking a button while logged in redirects to Polar's hosted checkout page
7. **Webhook:** After completing checkout in Polar sandbox, credits appear in user's balance (check via dashboard)
8. **Idempotency:** Replaying the same webhook does not double-credit

**Pre-requisite:** The `POLAR_WEBHOOK_SECRET` in `.env` must be set to the actual secret from the Polar sandbox dashboard, and a webhook endpoint must be configured there pointing to `<app-url>/api/auth/polar/webhooks` with the `order.paid` event enabled.
