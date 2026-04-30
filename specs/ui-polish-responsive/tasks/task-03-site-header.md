# Task 03: Site Header Responsive

## Status

complete

## Wave

1

## Description

Update the site header component with responsive padding and sizing so it scales better on mobile devices. Currently the header uses fixed `px-4 py-4` padding and `text-2xl` logo text that could be tighter on small phones. The action buttons also use a fixed `gap-4` that is generous on narrow screens.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** None

**Context from dependencies:** N/A

## Files to Modify

- `src/components/site-header.tsx` — Update Tailwind classes for responsive sizing

## Technical Details

### Implementation Steps

1. **Update nav padding** (line 19). Change:

```
container mx-auto px-4 py-4 flex justify-between items-center
```

To:

```
container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center
```

2. **Update logo text size** (line 21). Change the `<h1>` className from:

```
text-2xl font-bold
```

To:

```
text-xl sm:text-2xl font-bold
```

3. **Update actions group gap** (line 38). Change:

```
flex items-center gap-4
```

To:

```
flex items-center gap-2 sm:gap-4
```

### Current file reference

The full current file is at `src/components/site-header.tsx` (46 lines). The structure is:
- Skip-to-main-content link (accessibility)
- `<header className="border-b">` wrapper
- `<nav>` with logo on left, UserProfile + ModeToggle on right

## Acceptance Criteria

- [ ] Nav padding is `px-3 sm:px-4 py-3 sm:py-4`
- [ ] Logo text is `text-xl sm:text-2xl`
- [ ] Actions gap is `gap-2 sm:gap-4`
- [ ] Header looks good at 320px viewport width (no overflow, no cramping)
- [ ] Header looks unchanged at desktop widths (1024px+)
