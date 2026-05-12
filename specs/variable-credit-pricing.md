# Variable Credit Pricing + Pricing Page

## Context

The app currently uses a flat 1-credit-per-generation model regardless of which AI model is used. However, API costs range from ~$0.04 (GPT Image 1.5, Nano Banana) to ~$0.13 (Nano Banana Pro) — a 3.3x spread. This means we either overprice cheap models or lose money on expensive ones. We need variable per-model credit costs stored in the database (runtime-configurable), and a public pricing page so users understand what they're paying for. No actual payment integration yet — just the pricing infrastructure and UI.

## Agreed Pricing

**1 credit = $0.05** | **Target markup: ~4x API cost**

| Model | Display Name | API Cost | Credits | User Pays | Markup |
|-------|-------------|----------|---------|-----------|--------|
| `openai:gpt-image-1.5` | GPT Image 1.5 | ~$0.04 | 3 | $0.15 | 3.75x |
| `google:gemini-2.5-flash-image` | Nano Banana | ~$0.04 | 3 | $0.15 | 3.75x |
| `openai:gpt-image-2` | GPT Image 2 | ~$0.05 | 4 | $0.20 | 4.0x |
| `google:gemini-3.1-flash-image-preview` | Nano Banana 2 | ~$0.07 | 5 | $0.25 | 3.6x |
| `google:gemini-3-pro-image-preview` | Nano Banana Pro | ~$0.13 | 10 | $0.50 | 3.85x |

**Credit Packs:**

| Pack | Credits | Price | Per Credit | Bonus |
|------|---------|-------|------------|-------|
| Starter | 100 | $5.00 | $0.050 | — |
| Plus | 500 | $22.50 | $0.045 | 10% |
| Pro | 1,200 | $48.00 | $0.040 | 20% |

---

## Implementation Steps

### Step 1: Database — Add `modelPricing` table

**Modify:** `src/lib/schema.ts`

Add a new `modelPricing` table:
- `id` — UUID, primary key, random default
- `modelId` — text, unique, not null (e.g. `"openai:gpt-image-1.5"`)
- `creditCost` — integer, not null (e.g. `3`)
- `isActive` — boolean, default true (allows disabling a model's pricing without deleting)
- `createdAt` — timestamp, default now
- `updatedAt` — timestamp, default now, auto-update

Also add a `creditCost` integer column to the `generation` table to record the actual credits charged at generation time (important for historical accuracy if pricing changes later).

### Step 2: Run Drizzle migration

```sh
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Step 3: Seed pricing data

**Create:** `scripts/seed-model-pricing.ts`

Script that upserts the 5 model pricing rows into `modelPricing`. Should be idempotent (use `onConflictDoUpdate` on `modelId`). Add an npm script `db:seed-pricing` to `package.json`.

### Step 4: Update credit service for variable amounts

**Modify:** `src/services/credits/index.ts`

- Add `getModelCreditCost(modelId: string): Promise<number>` — queries `modelPricing` table, throws if model not found or inactive
- Add `getAllModelPricing(): Promise<Array<{modelId, creditCost}>>` — returns all active pricing (used by pricing page)
- Refactor `deductCredit(userId, amount)` — accept variable `amount` parameter instead of hardcoded 1
- Refactor `refundCredit(userId, amount)` — accept variable `amount` parameter instead of hardcoded 1
- Update balance check: `balance < amount` instead of `balance < 1`
- Update transaction descriptions to include credit count and model info

### Step 5: Update generation flow

**Modify:** `src/app/dashboard/actions.ts`

- After input validation, call `getModelCreditCost(modelId)` to get the credit cost
- Update pre-check: `balance < creditCost` instead of `balance < 1`
- Pass `creditCost` to `deductCredit(userId, creditCost)`
- Pass `creditCost` to `refundCredit(userId, creditCost)` on failure
- Store `creditCost` in the generation record when inserting into the `generation` table

### Step 6: Update generation insert to include creditCost

**Modify:** `src/services/image-generation/index.ts` (or wherever the generation row is inserted)

Add the `creditCost` field to the generation insert so we have a historical record of what was charged.

### Step 7: Create the Pricing page

**Create:** `src/app/(site)/pricing/page.tsx`

This is a standalone public page under the `(site)` layout (gets SiteHeader + SiteFooter automatically). It should follow the Neo-Cinema Dark design system.

**Page structure:**
1. **Page header** — eyebrow label (`04 — PRICING`), display heading ("Credits & Pricing"), description paragraph
2. **Credit Packs section** — 3 cards in a responsive grid (1 col mobile, 3 col desktop):
   - Each card: pack name, credit count, price, per-credit rate, "coming soon" CTA button
   - Plus pack highlighted as recommended (glow-lime border)
   - Cards use cinematic panel pattern: `border border-border/60 bg-card/40 rounded-none`
3. **Per-model cost table** — shows each model, its credit cost, and how many generations each pack gets you:
   - Table header: Model | Credits/Image | Starter (100) | Plus (500) | Pro (1,200)
   - Rows for each model with generation counts (e.g., 100/3 = 33 generations)
   - Use cinematic table styling with lime left-border on hover
4. **FAQ or note** — brief explanation: "Credits are deducted per generation. Cost varies by model."

**Data fetching:** Server component that calls `getAllModelPricing()` + reads model definitions for display names. Credit pack definitions can be a const array in the page file (or a shared constants file) since packs aren't in the DB yet.

### Step 8: Add navigation links

**Modify:** `src/components/site-header.tsx`
- Add `{ href: "/pricing", label: "Pricing" }` to `NAV_LINKS` array

**Modify:** `src/components/site-footer.tsx`
- Add `{ label: "Pricing", href: "/pricing" }` to the "Product" column

### Step 9: Update dashboard credit display

**Modify:** `src/components/generate/settings-panel.tsx` (or wherever model selection happens)

Show the credit cost next to each model in the dropdown so users know before generating. E.g., "GPT Image 2 — 4 credits". This requires fetching pricing data and passing it to the settings panel.

---

## Files Summary

**Create (2):**
- `src/app/(site)/pricing/page.tsx` — Pricing page
- `scripts/seed-model-pricing.ts` — Seed script

**Modify (7):**
- `src/lib/schema.ts` — Add `modelPricing` table + `creditCost` column on `generation`
- `src/services/credits/index.ts` — Variable deduction/refund + pricing queries
- `src/app/dashboard/actions.ts` — Use variable credit cost in generation flow
- `src/services/image-generation/index.ts` — Store creditCost in generation record (check where insert happens)
- `src/components/site-header.tsx` — Add Pricing nav link
- `src/components/site-footer.tsx` — Add Pricing footer link
- `src/components/generate/settings-panel.tsx` — Show credit cost per model in dropdown
- `package.json` — Add `db:seed-pricing` script

**Auto-generated (drizzle):**
- `drizzle/0004_*.sql` — Migration
- `drizzle/meta/0004_snapshot.json`

---

## Verification

1. **Migration:** Run `npx drizzle-kit generate` + `npx drizzle-kit migrate` — verify table exists
2. **Seed:** Run `npm run db:seed-pricing` — verify 5 rows in `modelPricing` table
3. **Generation flow:** Generate an image with different models, verify correct credit amounts are deducted and shown in transaction history
4. **Refund:** Trigger a failed generation (e.g., bad prompt), verify correct amount is refunded
5. **Pricing page:** Visit `/pricing` — verify packs display, per-model table is accurate, responsive layout works
6. **Navigation:** Verify "Pricing" link appears in site header and footer, links to `/pricing`
7. **Model dropdown:** Verify credit costs appear next to model names in the generation settings panel
8. **Lint + type check:** Run lint and type check to verify no regressions
