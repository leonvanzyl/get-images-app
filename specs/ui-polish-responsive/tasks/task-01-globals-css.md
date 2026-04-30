# Task 01: globals.css Foundation

## Status

complete

## Wave

1

## Description

Update `globals.css` to establish the visual foundation for the entire UI improvement. This includes importing the unused `tw-animate-css` package, refreshing the color palette with a subtle blue accent, adding custom keyframe animations, expanding the base layer with better defaults, and defining reusable utility classes. All subsequent tasks depend on the utilities and color tokens defined here.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-05-home-page.md, task-06-dashboard.md, task-07-chat-page.md, task-08-profile-page.md, task-09-auth-pages.md, task-10-setup-checklist.md, task-11-starter-prompt-modal.md

**Context from dependencies:** N/A — this is the foundation task.

## Files to Modify

- `src/app/globals.css` — Add tw-animate-css import, update color tokens, add animations, expand base layer, add utility classes

## Technical Details

### Implementation Steps

1. **Add tw-animate-css import** — The package `tw-animate-css@1.4.0` is already installed (in package.json) but never imported. Add the import right after the tailwindcss import:

```css
@import "tailwindcss";
@import "tw-animate-css";
```

2. **Add animation tokens to `@theme inline`** — Add these at the end of the existing `@theme inline` block (after the `--radius-xl` line):

```css
--animate-fade-in: fade-in 0.3s ease-out;
--animate-fade-up: fade-up 0.4s ease-out;
--animate-scale-in: scale-in 0.2s ease-out;
```

3. **Update light mode color tokens in `:root`** — Change these 3 values (leave all other tokens unchanged):

```css
/* CHANGE these 3 lines: */
--primary: oklch(0.21 0.034 270);          /* was oklch(0.21 0.006 285.885) */
--ring: oklch(0.705 0.06 270);              /* was oklch(0.705 0.015 286.067) */
--accent: oklch(0.96 0.012 270);            /* was oklch(0.967 0.001 286.375) */
```

4. **Update dark mode color tokens in `.dark`** — Change these 3 values (leave all other tokens unchanged):

```css
/* CHANGE these 3 lines: */
--primary: oklch(0.92 0.02 270);            /* was oklch(0.92 0.004 286.32) */
--ring: oklch(0.552 0.05 270);              /* was oklch(0.552 0.016 285.938) */
--accent: oklch(0.28 0.018 270);            /* was oklch(0.274 0.006 286.033) */
```

5. **Add keyframe definitions** — Add these right before the `@layer base` block:

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
```

6. **Expand the `@layer base` block** — Replace the existing `@layer base` block with:

```css
@layer base {
  * {
    @apply border-border;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-ring;
  }
}
```

7. **Add utility classes** — Add a new `@layer utilities` block after the `@layer base` block:

```css
@layer utilities {
  .card-interactive {
    @apply transition-all duration-200 ease-out;
  }
  .card-interactive:hover {
    @apply shadow-md -translate-y-0.5;
  }
  .auth-bg {
    background-image: radial-gradient(
      circle at 50% 0%,
      var(--accent) 0%,
      transparent 50%
    );
  }
}
```

### Final file structure (order of sections)

1. `@import "tailwindcss";`
2. `@import "tw-animate-css";`
3. `@theme inline { ... }` (with animation tokens added at end)
4. `:root { ... }` (with 3 updated color values)
5. `.dark { ... }` (with 3 updated color values)
6. `@keyframes` definitions (3 keyframes)
7. `@layer base { ... }` (expanded)
8. `@layer utilities { ... }` (new)

## Acceptance Criteria

- [ ] `tw-animate-css` is imported and animation utilities like `animate-fade-up` are available
- [ ] `:root` has `--primary: oklch(0.21 0.034 270)`, `--ring: oklch(0.705 0.06 270)`, `--accent: oklch(0.96 0.012 270)`
- [ ] `.dark` has `--primary: oklch(0.92 0.02 270)`, `--ring: oklch(0.552 0.05 270)`, `--accent: oklch(0.28 0.018 270)`
- [ ] Three keyframe animations (`fade-in`, `fade-up`, `scale-in`) are defined
- [ ] `@theme inline` includes `--animate-fade-in`, `--animate-fade-up`, `--animate-scale-in`
- [ ] `.card-interactive` utility class is defined with hover shadow and translate
- [ ] `.auth-bg` utility class is defined with radial gradient
- [ ] `html` has `scroll-behavior: smooth`
- [ ] `:focus-visible` has global outline styling
- [ ] All other existing color tokens remain unchanged
