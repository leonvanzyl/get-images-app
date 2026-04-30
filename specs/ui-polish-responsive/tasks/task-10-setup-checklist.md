# Task 10: Setup Checklist Card Adoption

## Status

pending

## Wave

2

## Description

Replace the bare `<div>` wrapper in the SetupChecklist component with a shadcn Card component for visual consistency with the rest of the app. The checklist is displayed on the home page and currently uses `p-6 border rounded-lg` which is the same pattern as the feature cards that are being upgraded to shadcn Cards.

## Dependencies

**Depends on:** task-01-globals-css.md
**Blocks:** None

**Context from dependencies:** Task 01 updates the color palette. The setup checklist does not use `card-interactive` since it's an informational display, not a clickable card.

## Files to Modify

- `src/components/setup-checklist.tsx` — Replace wrapper div with shadcn Card

## Technical Details

### Implementation Steps

1. **Add Card imports.** Add at the top:

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
```

2. **Replace the outer wrapper** (line 124). The current structure is:

```tsx
<div className="p-6 border rounded-lg text-left">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="font-semibold">Setup checklist</h3>
      <p className="text-sm text-muted-foreground">
        {completed}/{steps.length} completed
      </p>
    </div>
    <Button size="sm" onClick={load} disabled={loading}>
      {loading ? "Checking..." : "Re-check"}
    </Button>
  </div>

  {error ? <div className="text-sm text-destructive">{error}</div> : null}

  <ul className="space-y-2">
    ...checklist items...
  </ul>

  {data ? (
    <div className="mt-4 text-xs text-muted-foreground">
      Last checked: {new Date(data.timestamp).toLocaleString()}
    </div>
  ) : null}
</div>
```

Replace with:

```tsx
<Card className="text-left">
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-base">Setup checklist</CardTitle>
        <p className="text-sm text-muted-foreground">
          {completed}/{steps.length} completed
        </p>
      </div>
      <Button size="sm" onClick={load} disabled={loading}>
        {loading ? "Checking..." : "Re-check"}
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    {error ? <div className="text-sm text-destructive mb-4">{error}</div> : null}

    <ul className="space-y-2">
      ...checklist items stay the same...
    </ul>

    {data ? (
      <div className="mt-4 text-xs text-muted-foreground">
        Last checked: {new Date(data.timestamp).toLocaleString()}
      </div>
    ) : null}
  </CardContent>
</Card>
```

Key changes:
- Outer `<div>` → `<Card>` 
- Title area wrapped in `<CardHeader>` with the flex row inside
- `h3` → `<CardTitle className="text-base">` (text-base to match current visual size)
- Content wrapped in `<CardContent>`
- Error div gets `mb-4` since CardContent doesn't have the same padding structure
- All checklist items and timestamp stay exactly the same

## Acceptance Criteria

- [ ] Setup checklist uses shadcn `Card`/`CardHeader`/`CardTitle`/`CardContent`
- [ ] Visual appearance is consistent — no jarring size or spacing changes
- [ ] Title uses `CardTitle` with `text-base` to maintain current size
- [ ] Re-check button still works and is positioned to the right of the title
- [ ] Error state still displays correctly
- [ ] Checklist items render identically to before
- [ ] No TypeScript errors
