# Task 04: Site Footer Responsive

## Status

complete

## Wave

1

## Description

Update the site footer with responsive padding to match the header's responsive scaling and maintain consistent container padding across the app. Currently the footer uses fixed `py-6` and `px-4` that could be tighter on mobile and more generous on large screens.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** None

**Context from dependencies:** N/A

## Files to Modify

- `src/components/site-footer.tsx` — Update Tailwind classes for responsive padding

## Technical Details

### Implementation Steps

1. **Update footer padding** (line 5). Change:

```
border-t py-6 text-center text-sm text-muted-foreground
```

To:

```
border-t py-4 sm:py-6 text-center text-sm text-muted-foreground
```

2. **Update container padding** (line 6). Change:

```
container mx-auto px-4
```

To:

```
container mx-auto px-4 sm:px-6 lg:px-8
```

### Current file reference

The file is at `src/components/site-footer.tsx` (24 lines). It renders a `<footer>` with a GitHubStars component and an attribution link.

## Acceptance Criteria

- [ ] Footer padding is `py-4 sm:py-6`
- [ ] Container padding is `px-4 sm:px-6 lg:px-8`
- [ ] Footer is slightly more compact on mobile (py-4 vs py-6)
- [ ] Footer has more generous side padding on large screens (lg:px-8)
