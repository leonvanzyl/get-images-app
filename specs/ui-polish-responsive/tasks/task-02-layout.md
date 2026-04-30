# Task 02: Layout Sticky Footer

## Status

complete

## Wave

1

## Description

Update the root layout to use a flex column structure that pushes the footer to the bottom of the viewport on short-content pages. Currently, pages like login/register have minimal content and the footer floats up, leaving blank space below. Adding `min-h-screen flex flex-col` to the body and `flex-1` to the main element creates a proper sticky footer layout.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-09-auth-pages.md (auth pages rely on the flex-1 main for proper vertical centering)

**Context from dependencies:** N/A — this is a foundation task.

## Files to Modify

- `src/app/layout.tsx` — Add flex classes to body and main elements

## Technical Details

### Implementation Steps

1. **Add flex layout classes to the `<body>` element** (line 92). The current className is:

```tsx
className={`${geistSans.variable} ${geistMono.variable} antialiased`}
```

Change it to:

```tsx
className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
```

2. **Add `flex-1` to the `<main>` element** (line 101). The current element is:

```tsx
<main id="main-content">{children}</main>
```

Change it to:

```tsx
<main id="main-content" className="flex-1">{children}</main>
```

### Why this works

The ThemeProvider component (`src/components/theme-provider.tsx`) is a pass-through wrapper around `next-themes` ThemeProvider — it renders children directly without adding a wrapping `<div>`. So the flex column chain from `<body>` flows directly through to `<SiteHeader>`, `<main>`, and `<SiteFooter>`.

The `min-h-screen` ensures the body fills at least the full viewport. `flex flex-col` creates a vertical flex container. `flex-1` on `<main>` makes it expand to fill all available space, pushing `<SiteFooter>` to the bottom.

## Acceptance Criteria

- [ ] `<body>` has classes `min-h-screen flex flex-col` in addition to existing font variable classes
- [ ] `<main>` has `className="flex-1"` 
- [ ] On short-content pages (e.g. `/login`), the footer sits at the bottom of the viewport
- [ ] On long-content pages (e.g. `/profile`), the footer sits below the content as usual
- [ ] No visual regressions on any page
