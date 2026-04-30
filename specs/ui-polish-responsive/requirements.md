# Requirements: UI Polish & Responsive Improvements

## Summary

The boilerplate UI is functional but visually flat — bare `<div>` elements instead of shadcn Cards, a monotone neutral-gray palette, no hover/transition effects, and minimal responsive breakpoints (most pages only use `md:`). The goal is to meaningfully improve visual quality, component consistency, and responsive behavior across all pages and components.

All changes must use Tailwind utilities and shadcn standards. Custom styling (animations, utilities, color tokens) goes in `globals.css`. No custom inline styles or CSS-in-JS on individual components. The result should look like a polished, high-quality default that can be customized by users of the boilerplate.

## Goals

- Refresh the color palette with a subtle cool blue accent (shift primary/ring/accent from flat gray to hue 270)
- Replace all bare `<div>` cards with shadcn Card components for consistency
- Replace native `<input>`, `<button>`, and `<textarea>` elements with their shadcn equivalents
- Add hover/transition effects to interactive cards via a reusable `card-interactive` utility
- Introduce `sm:` breakpoints throughout for proper tablet/mobile scaling
- Add entrance animations to auth pages
- Fix the sticky footer layout so it works on short-content pages
- Ensure all pages scale well from 320px to 1536px+ viewports

## Non-Goals

- No hamburger/mobile menu for the header — the current content (avatar + theme toggle) is minimal enough
- No new shadcn component installations — all needed components are already installed
- No changes to business logic, API routes, or authentication flows
- No new pages or routes
- No changes to the Geist font choice
- No Storybook or component documentation

## Acceptance Criteria

- [ ] All pages render correctly in both light and dark modes
- [ ] No horizontal scroll on any page at 320px viewport width
- [ ] Feature cards, dashboard cards, and next steps cards use shadcn Card components
- [ ] Chat input uses shadcn Input, not a native `<input>`
- [ ] Footer sticks to the bottom on short-content pages (auth pages)
- [ ] Primary color has a visible cool-blue tint (not flat gray)
- [ ] Cards have hover lift effect with shadow transition
- [ ] All grids have `sm:` breakpoints for tablet-size viewports
- [ ] `pnpm lint` and `pnpm typecheck` pass with no errors

## Assumptions

- Tailwind CSS v4 is in use (confirmed: `@import "tailwindcss"` syntax, `@theme inline` block)
- `tw-animate-css` is installed in dependencies but currently unused (confirmed in package.json)
- The ThemeProvider from next-themes renders children directly without a wrapping `<div>` (confirmed by reading the component)
- All shadcn components needed (Card, Input, Button, Textarea, Badge, Avatar, Dialog) are already installed

## Technical Constraints

- All custom CSS (animations, utilities, color tokens) must go in `src/app/globals.css`
- Component files should only use Tailwind utility classes and shadcn components — no `style={{}}` props
- Must maintain both light and dark mode support via the existing OKLch CSS variable system
- Must not break existing functionality (auth flows, chat, diagnostics)
