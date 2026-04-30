# Task 09: Auth Pages

## Status

pending

## Wave

2

## Description

Polish all 4 auth pages (login, register, forgot-password, reset-password) with entrance animations, card shadows, a subtle background gradient, and improved vertical centering that works with the new flex layout. These pages are the first thing new users see, so visual polish matters.

## Dependencies

**Depends on:** task-01-globals-css.md, task-02-layout.md
**Blocks:** None

**Context from dependencies:** Task 01 defines the `auth-bg` utility class (radial gradient from accent color) and the `animate-fade-up` animation in globals.css. Task 02 adds `flex-1` to the `<main>` element, so auth pages can use `flex-1` to fill available vertical space properly.

## Files to Modify

- `src/app/(auth)/login/page.tsx` — Add animation, shadow, background, update min-height
- `src/app/(auth)/register/page.tsx` — Same changes
- `src/app/(auth)/forgot-password/page.tsx` — Same changes
- `src/app/(auth)/reset-password/page.tsx` — Same changes

## Technical Details

### Implementation Steps

All 4 files follow the exact same pattern. Each has an outer wrapper div with a Card inside.

#### For each file, make these 2 changes:

**Change 1: Update the wrapper div.** Each file has:

```tsx
<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
```

Change to:

```tsx
<div className="auth-bg flex flex-1 min-h-[calc(100vh-8rem)] items-center justify-center p-4">
```

Changes:
- `auth-bg` — adds the subtle radial gradient background from globals.css
- `flex-1` — fills available space in the flex column layout (from Task 02)
- `min-h-[calc(100vh-8rem)]` — accounts for both header and footer height (was just 4rem for header)

**Change 2: Add shadow and animation to the Card.** Each file has:

```tsx
<Card className="w-full max-w-md">
```

Change to:

```tsx
<Card className="w-full max-w-md shadow-lg animate-fade-up">
```

Changes:
- `shadow-lg` — adds elevation/depth to the card
- `animate-fade-up` — entrance animation (defined in globals.css keyframes, registered in @theme inline)

### File-specific locations:

**login/page.tsx:**
- Wrapper div: line 27
- Card: line 28

**register/page.tsx:**
- Wrapper div: line 20
- Card: line 21

**forgot-password/page.tsx:**
- Wrapper div: line 21
- Card: line 22

**reset-password/page.tsx:**
- Wrapper div: line 21
- Card: line 22

## Acceptance Criteria

- [ ] All 4 auth pages have `auth-bg` class on the wrapper div
- [ ] All 4 auth pages have `flex-1 min-h-[calc(100vh-8rem)]` on the wrapper div
- [ ] All 4 auth cards have `shadow-lg` for depth
- [ ] All 4 auth cards have `animate-fade-up` for entrance animation
- [ ] Cards animate upward on page load (smooth fade + translate)
- [ ] Subtle radial gradient visible in the background (especially visible in dark mode)
- [ ] Footer stays at the bottom of the viewport on all auth pages
- [ ] No visual regressions to auth form functionality
