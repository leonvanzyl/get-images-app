# Task 05: Home Page Overhaul

## Status

pending

## Wave

2

## Description

Overhaul the home page with responsive typography, shadcn Card components replacing bare divs, hover effects on interactive cards, and better grid breakpoints. This is the highest-visibility page and sets the visual tone for the entire app. The feature cards and next steps cards are currently plain `<div>` elements with `border rounded-lg` — they need to be replaced with proper shadcn Card components with the `card-interactive` hover utility.

## Dependencies

**Depends on:** task-01-globals-css.md
**Blocks:** None

**Context from dependencies:** Task 01 defines the `card-interactive` utility class in globals.css which provides `transition-all duration-200 ease-out` with hover effects (`shadow-md -translate-y-0.5`). This task uses that class on all interactive cards. Task 01 also updates the color palette so `text-primary` on icons will show the new blue-tinted primary color.

## Files to Modify

- `src/app/page.tsx` — Replace bare divs with shadcn Cards, update typography responsive classes, fix grid breakpoints

## Technical Details

### Implementation Steps

1. **Add Card imports** at the top of the file. Add this import:

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
```

2. **Update container spacing** (line 13). Change:

```
className="flex-1 container mx-auto px-4 py-12"
```

To:

```
className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
```

3. **Update hero h1 typography** (line 20). Change:

```
className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent"
```

To:

```
className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent"
```

4. **Update hero h2 subtitle** (line 24). Change:

```
className="text-2xl font-semibold text-muted-foreground"
```

To:

```
className="text-xl sm:text-2xl font-semibold text-muted-foreground"
```

5. **Update hero description paragraph** (line 27). Change:

```
className="text-xl text-muted-foreground"
```

To:

```
className="text-base sm:text-lg md:text-xl text-muted-foreground"
```

6. **Update "Video Tutorial" heading** (line 35). Change:

```
className="text-2xl font-semibold flex items-center justify-center gap-2"
```

To:

```
className="text-xl sm:text-2xl font-semibold flex items-center justify-center gap-2"
```

7. **Add shadow to video embed container** (line 43). Change:

```
className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border"
```

To:

```
className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border shadow-md"
```

8. **Update feature grid** (line 55). Change:

```
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
```

To:

```
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12"
```

9. **Replace all 4 feature card divs** (lines 56-92) with shadcn Card components. Each card currently looks like:

```tsx
<div className="p-6 border rounded-lg">
  <h3 className="font-semibold mb-2 flex items-center gap-2">
    <Shield className="h-4 w-4" />
    Authentication
  </h3>
  <p className="text-sm text-muted-foreground">
    Better Auth with Google OAuth integration
  </p>
</div>
```

Replace each with:

```tsx
<Card className="card-interactive">
  <CardHeader className="pb-3">
    <CardTitle className="text-base flex items-center gap-2">
      <Shield className="h-4 w-4 text-primary" />
      Authentication
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Better Auth with Google OAuth integration
    </p>
  </CardContent>
</Card>
```

Do this for all 4 cards (Authentication/Shield, Database/Database, AI Ready/Bot, UI Components/Palette). Add `text-primary` to each icon.

10. **Update "Next Steps" heading** (line 97). Change:

```
className="text-2xl font-semibold"
```

To:

```
className="text-xl sm:text-2xl font-semibold"
```

11. **Update next steps grid** (line 98). Change:

```
className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left"
```

To:

```
className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
```

12. **Replace all 4 next steps card divs** (lines 99-169) with shadcn Card components. Each currently looks like:

```tsx
<div className="p-4 border rounded-lg">
  <h4 className="font-medium mb-2">1. Set up environment variables</h4>
  ...content...
</div>
```

Replace each wrapper with:

```tsx
<Card className="card-interactive">
  <CardContent className="pt-6">
    <h4 className="font-medium mb-2">1. Set up environment variables</h4>
    ...content stays the same...
  </CardContent>
</Card>
```

Use `pt-6` on CardContent since there's no CardHeader for these simpler cards.

## Acceptance Criteria

- [ ] Hero h1 scales: `text-3xl` on mobile, `text-4xl` on sm, `text-5xl` on md+
- [ ] Hero h2 and description also scale responsively
- [ ] Feature grid uses `sm:grid-cols-2` breakpoint (2 columns at 640px)
- [ ] All 4 feature cards use shadcn `Card`/`CardHeader`/`CardContent` with `card-interactive`
- [ ] All feature card icons have `text-primary` class
- [ ] All 4 next steps cards use shadcn `Card`/`CardContent` with `card-interactive`
- [ ] Video embed has `shadow-md` 
- [ ] Container has responsive padding: `px-4 sm:px-6 lg:px-8`
- [ ] No TypeScript errors (Card imports are correct)
