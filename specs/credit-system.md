# Credit System

## Context

The app can generate images but has no usage control. The sidebar shows hardcoded mock usage stats (`MOCK_RUNS_USED=47`, `MOCK_RUNS_QUOTA=500`). We need a real credit system that:
- Gives new/existing users 0 credits by default
- Deducts 1 credit per image generation
- Allows manual credit addition via direct DB access for now
- Is extensible for future Stripe/Polar payment integration

---

## Design Decisions

**Separate `credit_balance` table** (not a column on `user`): The `user` table is managed by Better Auth and shouldn't be extended with app-specific columns. A separate table is easier to extend later with `stripeCustomerId`, etc.

**`credit_transaction` table for audit trail**: Every credit change gets an immutable ledger entry. The balance column is the denormalized running total, always kept in sync within the same DB transaction. Future payment reconciliation can use `SUM(amount)` to verify.

**Deduct-then-generate with refund on failure**: Deduct the credit in a transaction with `FOR UPDATE` row lock (prevents double-spend), then call the AI provider. If generation fails, insert a refund transaction. Simple and prevents overspending.

**Credit check in server action, logic in service**: The server action (`actions.ts`) orchestrates auth + credit check + generation. The transactional credit logic lives in a dedicated credit service (`src/services/credits/`), following the existing architecture pattern.

---

## Schema

Two new tables added to `src/lib/schema.ts`:

**`credit_balance`**
- `id` — text PK (`crypto.randomUUID()`)
- `userId` — text FK → `user.id`, unique, cascade delete
- `balance` — integer, default 0
- `createdAt` — timestamp, default now
- `updatedAt` — timestamp, default now, auto-updates

**`credit_transaction`**
- `id` — text PK (`crypto.randomUUID()`)
- `userId` — text FK → `user.id`, cascade delete
- `amount` — integer (positive for additions, negative for deductions)
- `type` — text: `"addition"` | `"deduction"` | `"refund"`
- `description` — text, nullable (human-readable reason)
- `referenceId` — text, nullable (for future Stripe Payment Intent IDs)
- `createdAt` — timestamp, default now

Indexes: `userId`, `createdAt`, `type` on transactions; `userId` (unique) on balance.

---

## Service Layer — `src/services/credits/`

### `src/services/credits/errors.ts`

- `InsufficientCreditsError` extending `Error` with code `"INSUFFICIENT_CREDITS"`

### `src/services/credits/index.ts`

| Function | Purpose |
|----------|---------|
| `getBalance(userId)` | Returns current credit count (0 if no row exists) |
| `deductCredit(userId)` | Transaction: `SELECT ... FOR UPDATE`, check balance >= 1, decrement, insert deduction record |
| `refundCredit(userId, description?)` | Transaction: increment balance, insert refund record |
| `addCredits(userId, amount, description?)` | Transaction: upsert balance row, insert addition record |

All mutating functions use `db.transaction()` with `FOR UPDATE` row lock to prevent race conditions.

---

## Integration — `src/app/dashboard/actions.ts`

Modify `generateImageAction`:
1. After auth check, call `getBalance()` — fast non-locking pre-check
2. Call `deductCredit()` — authoritative transactional deduction with row lock
3. Call `generate()` — existing image generation
4. On generation failure: call `refundCredit()` to restore the credit
5. On success: call `revalidatePath("/dashboard", "layout")` to refresh sidebar balance

Add new action: `getCreditBalanceAction()` for client-side balance queries.

---

## UI Changes

### Dashboard layout — `src/app/dashboard/layout.tsx`
- Fetch credit balance using `getBalance(session.user.id)`
- Pass `creditBalance` prop to `DashboardChrome`

### Dashboard chrome — `src/components/dashboard/dashboard-chrome.tsx`
- Add `creditBalance: number` prop
- Forward to both `DashboardSidebar` instances

### Sidebar — `src/components/dashboard/dashboard-sidebar.tsx`
- Remove `MOCK_RUNS_USED` and `MOCK_RUNS_QUOTA` constants
- Add `creditBalance: number` prop
- Change label to cinematic equivalent (e.g. "Credits on reel")
- Display balance with leading zeros: `String(balance).padStart(3, "0")`
- Remove the progress bar entirely (no quota — just a simple counter)
- Keep cinematic panel styling (`border border-border/60 bg-background/40`)

### Error Language

Cinematic copy for credit errors:
- Insufficient credits: `"No credits remaining on this reel. Add credits to resume production."`
- Deduction failure: `"Credit reel jam — please try again."`

---

## Transaction Flow

```
generateImageAction()
  1. Auth check
  2. Input validation
  3. getBalance() → fast pre-check (no lock)
     └─ balance < 1 → return error
  4. deductCredit() → transactional (FOR UPDATE lock)
     └─ balance < 1 → throw InsufficientCreditsError
     └─ UPDATE balance - 1, INSERT transaction
  5. generate() → call AI provider, upload, save
     ├─ SUCCESS → revalidatePath, return result
     └─ FAILURE → refundCredit() → return error
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/lib/schema.ts` | Modify | Add `creditBalance` + `creditTransaction` tables |
| `src/services/credits/index.ts` | Create | Credit service: `getBalance`, `deductCredit`, `refundCredit`, `addCredits` |
| `src/services/credits/errors.ts` | Create | `InsufficientCreditsError` error class |
| `src/app/dashboard/actions.ts` | Modify | Credit check/deduct in `generateImageAction`, add `getCreditBalanceAction` |
| `src/app/dashboard/layout.tsx` | Modify | Fetch + pass credit balance |
| `src/components/dashboard/dashboard-chrome.tsx` | Modify | Forward `creditBalance` prop |
| `src/components/dashboard/dashboard-sidebar.tsx` | Modify | Replace mock data with real credit balance |
| `drizzle/0003_*.sql` | Generated | Migration for new tables |

---

## Future Payment Compatibility

- `creditBalance` table can gain `stripeCustomerId` column
- `creditTransaction.referenceId` stores Stripe Payment Intent IDs
- `creditTransaction.type` is text (not DB enum) — extensible to `"purchase"`, `"subscription_renewal"`, `"promo"`
- Stripe webhook handler would call `addCredits(userId, amount, description)` on successful payment

---

## Verification

1. Run `pnpm db:push` to apply schema changes
2. Run `pnpm lint` and `pnpm typecheck` to verify no type errors
3. Manually add credits to a test user via Drizzle Studio (`pnpm db:studio`)
4. Generate an image — verify credit balance decrements in the sidebar
5. Try generating with 0 credits — verify cinematic error message appears
6. Check `credit_transaction` table has the deduction record
