# Task 11: Starter Prompt Modal

## Status

pending

## Wave

2

## Description

Replace the native `<textarea>` in the StarterPromptModal with the shadcn Textarea component for visual consistency, and make the button row responsive so buttons stack on very small screens.

## Dependencies

**Depends on:** task-01-globals-css.md
**Blocks:** None

**Context from dependencies:** Task 01 updates the color palette. No utility classes from Task 01 are used in this component.

## Files to Modify

- `src/components/starter-prompt-modal.tsx` — Replace native textarea, update button layout

## Technical Details

### Implementation Steps

1. **Add Textarea import.** Add at the top:

```tsx
import { Textarea } from "@/components/ui/textarea";
```

2. **Replace native `<textarea>`** (lines 161-167). Change:

```tsx
<textarea
  id="project-description"
  placeholder="e.g., A task management app for teams with real-time collaboration, project timelines, and AI-powered task prioritization..."
  value={projectDescription}
  onChange={(e) => setProjectDescription(e.target.value)}
  className="w-full h-24 px-3 py-2 border rounded-md resize-none text-sm"
/>
```

To:

```tsx
<Textarea
  id="project-description"
  placeholder="e.g., A task management app for teams with real-time collaboration, project timelines, and AI-powered task prioritization..."
  value={projectDescription}
  onChange={(e) => setProjectDescription(e.target.value)}
  className="h-24 resize-none"
/>
```

Key changes:
- `<textarea>` → `<Textarea>` (shadcn component)
- Remove explicit `w-full px-3 py-2 border rounded-md text-sm` — the shadcn Textarea handles these styles internally
- Keep `h-24 resize-none` as overrides

3. **Update button row** (line 174). Change:

```
className="flex gap-2"
```

To:

```
className="flex flex-col-reverse sm:flex-row gap-2"
```

This makes the buttons stack on mobile (with Cancel on top via `flex-col-reverse`) and sit side-by-side on sm+.

## Acceptance Criteria

- [ ] Textarea uses shadcn `Textarea` component, not a native `<textarea>`
- [ ] Textarea has consistent focus ring styling matching other form elements
- [ ] Button row stacks on mobile (`flex-col-reverse`) and is horizontal on sm+ (`sm:flex-row`)
- [ ] "Copy Starter Prompt" button appears before "Cancel" button in both layouts
- [ ] Textarea placeholder text renders correctly
- [ ] Copy functionality still works (the `projectDescription` state binding is unchanged)
- [ ] No TypeScript errors
