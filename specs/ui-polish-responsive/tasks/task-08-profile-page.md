# Task 08: Profile Page

## Status

pending

## Wave

2

## Description

Update the profile page with responsive stacking, improved grid breakpoints, and flex-wrap on tight rows. The avatar section needs to stack vertically on mobile, the quick actions grid needs an intermediate `sm:` breakpoint, and all the `flex items-center justify-between` rows in cards and dialogs need `flex-wrap` to prevent overflow on narrow screens.

## Dependencies

**Depends on:** task-01-globals-css.md
**Blocks:** None

**Context from dependencies:** Task 01 updates the color palette. No utility classes from Task 01 are specifically used on this page (profile cards are informational, not interactive).

## Files to Modify

- `src/app/profile/page.tsx` — Update responsive classes throughout

## Technical Details

### Implementation Steps

1. **Update container** (line 67). Change:

```
className="container max-w-4xl mx-auto py-8 px-4"
```

To:

```
className="container max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8"
```

2. **Update title row** (line 68). Change:

```
className="flex items-center gap-4 mb-8"
```

To:

```
className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
```

3. **Update title text** (line 78). Change:

```
className="text-3xl font-bold"
```

To:

```
className="text-2xl sm:text-3xl font-bold"
```

4. **Update avatar section** (line 85). Change:

```
className="flex items-center space-x-4"
```

To:

```
className="flex flex-col items-center sm:flex-row sm:items-center gap-4"
```

Important: remove `space-x-4` entirely — it conflicts with `flex-col`. The `gap-4` handles spacing in both directions.

5. **Update avatar size** (line 86). Change:

```
className="h-20 w-20"
```

To:

```
className="h-16 w-16 sm:h-20 sm:w-20"
```

6. **Update text container** next to avatar (line 96). Change:

```
className="space-y-2"
```

To:

```
className="space-y-2 text-center sm:text-left"
```

7. **Update name heading** (line 97). Change:

```
className="text-2xl font-semibold"
```

To:

```
className="text-xl sm:text-2xl font-semibold"
```

8. **Update email row** (line 98). Change:

```
className="flex items-center gap-2 text-muted-foreground"
```

To:

```
className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-muted-foreground"
```

9. **Update Account Status grid** (line 160). Change:

```
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

To:

```
className="grid grid-cols-1 sm:grid-cols-2 gap-4"
```

10. **Update all status/activity flex rows** — add `flex-wrap gap-2` and responsive padding. These appear at multiple locations. For each row that has `flex items-center justify-between p-4 border rounded-lg`, change to:

```
flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border rounded-lg
```

Apply this to the following locations:
- Line 161 (Email Verification status)
- Line 172 (Account Type status)
- Line 196 (Current Session activity)

11. **Update Quick Actions grid** (line 224). Change:

```
className="grid grid-cols-1 md:grid-cols-3 gap-4"
```

To:

```
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

12. **Update dialog inner rows** — For the Security Settings dialog (lines 325, 342, 357), each row with `flex items-center justify-between p-4 border rounded-lg`, change to:

```
flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border rounded-lg
```

13. **Update Email Preferences dialog rows** (lines 388, 396) — same pattern, change:

```
flex items-center justify-between p-4 border rounded-lg
```

To:

```
flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border rounded-lg
```

## Acceptance Criteria

- [ ] Avatar section stacks vertically on mobile (flex-col) and is horizontal on sm+
- [ ] Avatar is smaller on mobile (h-16 w-16) and full size on sm+ (h-20 w-20)
- [ ] Text next to avatar is centered on mobile, left-aligned on sm+
- [ ] Email row wraps on narrow screens (flex-wrap)
- [ ] Quick actions grid has intermediate breakpoint: 1 col → 2 at sm → 3 at lg
- [ ] Account status grid uses sm:grid-cols-2 instead of md:grid-cols-2
- [ ] All flex justify-between rows in cards and dialogs have flex-wrap and gap-2
- [ ] Container and title have responsive padding and sizing
- [ ] No overflow or horizontal scroll at 320px viewport
- [ ] Profile page title scales: `text-2xl sm:text-3xl`
