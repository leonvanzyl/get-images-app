# Get Images — Design System

> **Neo-Cinema Dark** — A cinematic, film-production-inspired aesthetic. Dark mode is canonical; light mode exists as a paper-cream inversion. Every surface, label, and interaction is designed to evoke a film studio control room: grain overlays, scanlines, sprocket holes, bracket-frame hover states, and blinking cursor indicators.

---

## 1. Theme Identity

**Name:** Neo-Cinema Dark
**Default mode:** Dark (`:root` / `.dark`)
**Light mode:** Paper-cream inversion (`.light`)
**Managed by:** `next-themes` with `attribute="class"` and `defaultTheme="dark"`

### Personality

- Film studio / post-production control room
- Monospaced labels and frame numbers everywhere
- Lime-green accent as the "live signal" color
- Quiet, functional chrome — information density over decoration
- Cinematic terminology: frames, plates, reels, seeds, runs

---

## 2. Color System

All colors use **OKLCH** for perceptual uniformity. Tokens are defined as CSS custom properties on `:root` / `.dark` / `.light` in `globals.css` and mapped to Tailwind via `@theme inline`.

### Dark Mode (Canonical)

| Token               | OKLCH Value              | Role                         |
|----------------------|--------------------------|-------------------------------|
| `--background`       | `oklch(0.09 0.008 240)` | Page background               |
| `--foreground`       | `oklch(0.96 0 0)`       | Primary text                  |
| `--card`             | `oklch(0.13 0.008 240)` | Card / panel surfaces         |
| `--card-foreground`  | `oklch(0.96 0 0)`       | Card text                     |
| `--primary`          | `oklch(0.9 0.22 130)`   | **Lime accent** — CTAs, active states, glow |
| `--primary-foreground` | `oklch(0.12 0.02 130)` | Text on primary               |
| `--secondary`        | `oklch(0.17 0.008 240)` | Secondary surfaces            |
| `--muted`            | `oklch(0.16 0.008 240)` | Subdued surfaces              |
| `--muted-foreground` | `oklch(0.62 0.01 240)`  | Secondary / label text        |
| `--accent`           | `oklch(0.18 0.01 240)`  | Hover / focus highlight       |
| `--destructive`      | `oklch(0.65 0.22 25)`   | Error / danger red            |
| `--border`           | `oklch(0.22 0.008 240)` | Borders (usually at `/60` opacity) |
| `--input`            | `oklch(0.18 0.008 240)` | Form input backgrounds        |
| `--ring`             | `oklch(0.9 0.22 130)`   | Focus ring (lime)             |
| `--sidebar`          | `oklch(0.11 0.008 240)` | Sidebar recess                |

### Light Mode

Light mode inverts to paper-cream (`oklch(0.97 0.01 90)`) and ink-black (`oklch(0.18 0.01 240)`). The lime accent deepens for legibility: `oklch(0.62 0.18 130)`.

### Chart Palette

Five chart colors: lime, deep teal, amber, magenta, ice-blue — defined via `--chart-1` through `--chart-5`.

### Semantic Opacity

Borders typically use `/60` opacity (e.g., `border-border/60`). Text hierarchy uses `/80`, `/85`, `/90`, `/95` variants off `foreground`. Muted text at `/40`–`/70`.

---

## 3. Typography

### Font Stack

| Slot      | Font                 | CSS Variable       | Usage                                  |
|-----------|----------------------|---------------------|----------------------------------------|
| Display   | Bricolage Grotesque  | `--font-display`   | Hero headlines, section titles, dialog titles |
| Body      | Hanken Grotesk       | `--font-body`      | Paragraphs, descriptions, UI text      |
| Mono      | JetBrains Mono       | `--font-mono`      | Labels, metadata, eyebrows, nav links, code, counters |

All loaded via `next/font/google` with `display: "swap"`.

### OpenType Features

```css
font-feature-settings: "ss01", "cv11", "calt";
```

### Type Scale & Patterns

| Pattern                   | Class                                                     |
|---------------------------|-----------------------------------------------------------|
| **Hero headline**         | `font-display text-6xl font-semibold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl` |
| **Section heading**       | `font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl` |
| **Dialog title**          | `font-display text-2xl font-semibold tracking-tight`      |
| **Body paragraph**        | `text-base leading-relaxed text-muted-foreground sm:text-lg` |
| **Section eyebrow**       | `font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground` |
| **Nav link**              | `font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground` |
| **Label (field/meta)**    | `font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground` |
| **Inline label (11px)**   | `font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground` |
| **Metadata dot-separated**| `font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground` with `·` separators |
| **Counter / tabular**     | `font-mono tabular-nums` — pad with leading zeros via `String(n).padStart(N, "0")` |
| **Code / keys**           | `font-mono text-xs text-foreground`                       |

### Key Typography Rules

- **ALL labels are uppercase monospaced** — no exceptions.
- **Letter-spacing conventions:** `0.22em` for primary labels, `0.18em` for secondary metadata, `0.14em`–`0.16em` for nav/filter items, `0.32em` for cinematic markers.
- **Leading zeros** are used for counters: `001`, `047`, `003 / 500`.
- **Section eyebrows** follow the pattern: `01 — SECTION NAME` or `01 — SECTION NAME / SUBSECTION · DETAIL`.
- **Dot separators** use `·` (middle dot) between metadata items, rendered with `text-muted-foreground/40` or `/60`.

---

## 4. Spacing & Layout

### Container

```
container mx-auto px-4 sm:px-6
```

- Max width: default Tailwind container
- Horizontal padding: `px-4` (mobile), `sm:px-6` (640px+)

### Section Spacing

| Pattern              | Classes                          |
|----------------------|-----------------------------------|
| Section vertical     | `py-24 lg:py-32`                 |
| Section header gap   | `mb-12 flex flex-col gap-4`      |
| Card padding         | `p-5` or `p-6`                   |
| Inner panel dividers | `h-px bg-border` (aria-hidden)   |
| Between sections     | `border-b border-border/60`      |

### Dashboard Layout

```
min-h-screen md:grid md:grid-cols-[260px_1fr]
```

- Sidebar: 260px fixed width (hidden on mobile, sheet on mobile)
- Topbar: `sticky top-0 z-30 h-14`

### Radius

Base radius: `0.5rem`. Sharp (no radius) is used for cinematic elements:
- **Buttons in cinematic context:** `rounded-none`
- **Cards / panels / dialogs:** `rounded-none` (sharp edges)
- **shadcn defaults:** keep `rounded-md` / `rounded-lg` where appropriate

**Rule:** Dashboard chrome, action buttons, select triggers, badges, dialogs all use `rounded-none`. Only standard UI primitives (dropdowns, tooltips) keep their default radius.

---

## 5. Component Patterns

### 5.1 Buttons

**Source:** `src/components/ui/button.tsx` (shadcn CVA)

| Variant       | Usage                                          |
|---------------|------------------------------------------------|
| `default`     | Primary actions — lime bg, dark text            |
| `destructive` | Danger actions — red                            |
| `outline`     | Secondary actions — border + transparent        |
| `secondary`   | Alternative secondary                           |
| `ghost`       | Minimal — no border, hover bg only              |
| `link`        | Text link style with underline                  |

**Sizes:** `sm` (h-8), `default` (h-9), `lg` (h-10), `icon` (size-9).

**Cinematic CTA pattern:**
```tsx
<Button className="glow-lime rounded-none px-6 font-mono text-xs uppercase tracking-[0.18em]">
  Action text →
</Button>
```

CTA buttons always include:
- `glow-lime` for the lime box-shadow
- `rounded-none` for sharp edges
- Monospaced uppercase text
- Arrow suffix (`→`) for primary CTAs

### 5.2 Cards & Panels

**Source:** `src/components/ui/card.tsx`

Standard cards: `rounded-lg border bg-card text-card-foreground shadow-sm`.

**Cinematic panel pattern** (used in settings, filters, MCP overview):
```tsx
<div className="border border-border/60 bg-card/40">
  {/* Header bar */}
  <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
      Panel title
    </p>
  </div>
  {/* Content */}
  <div className="p-5">...</div>
</div>
```

- Use `bg-card/40` or `bg-background/40` for semi-transparent surfaces
- Section dividers: `<div aria-hidden="true" className="h-px bg-border" />`

### 5.3 Section Headers (Landing)

Section headers follow a strict pattern with a left lime border:

```tsx
<header className="mb-12 flex flex-col gap-4 border-l border-primary/40 pl-4">
  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
    02 — SECTION TITLE
  </p>
  <h2 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl">
    Headline text here.
  </h2>
  <p className="max-w-xl text-base text-muted-foreground">
    Description paragraph.
  </p>
</header>
```

- Numbered eyebrow: `01 — NAME`, `02 — NAME`, etc.
- Left border: `border-l border-primary/40 pl-4`
- Max prose width: `max-w-xl`

### 5.4 Forms & Inputs

**Input:** `h-9` (standard), `h-10` (settings/filters), `h-12` (dialog emphasis).

**Cinematic input override:**
```
rounded-none border-border bg-background/40 font-mono text-xs uppercase tracking-[0.12em]
```

**Select triggers in dashboard context:**
```
h-10 w-full rounded-none border-border/60 bg-background/40 font-mono text-xs uppercase tracking-[0.14em]
```

**Chip selectors** (aspect ratio, style presets):
```tsx
<button
  className={cn(
    "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
    selected
      ? "border-primary text-primary glow-lime"
      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
  )}
>
```

### 5.5 Badges

**Cinematic badge pattern** (API key status):
```tsx
<Badge
  variant="outline"
  className="gap-1.5 rounded-none border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary"
>
  <span className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.9_0.22_130/0.7)]" />
  Active
</Badge>
```

Status indicators use a glowing dot + uppercase label.

### 5.6 Tables

Tables use `border border-border/60 bg-card/40` wrapper. Table headers are styled with the standard meta label pattern. Rows get a lime left-border accent on hover:

```
[&>td:first-child]:border-l-2 [&>td:first-child]:border-transparent
hover:[&>td:first-child]:border-primary
```

### 5.7 Dialogs

```tsx
<DialogContent className="gap-5 rounded-none border-border bg-card sm:max-w-[520px]">
```

- Always `rounded-none`
- Step indicators: `font-mono text-[10px]` eyebrow like `New key — 01 / 02`
- Title: `font-display text-2xl font-semibold tracking-tight`
- Footer buttons: ghost + primary with `glow-lime rounded-none font-mono text-xs uppercase tracking-[0.18em]`

### 5.8 Empty States

```tsx
<div className="border border-dashed border-border/60 bg-card/40 p-16 text-center">
  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
    — empty reel —
  </p>
  <p className="mt-4 font-mono text-sm uppercase tracking-[0.18em] text-foreground">
    No frames match
  </p>
  <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
    Descriptive help text.
  </p>
</div>
```

Use dashed borders and cinematic language.

---

## 6. Cinematic Chrome & Decorative Elements

### 6.1 Live Indicator Dot

A blinking lime dot used throughout to signal "live" / "connected":

```tsx
<span
  aria-hidden="true"
  className="inline-block size-2 rounded-full bg-primary animate-cursor-blink shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)]"
/>
```

Sizes: `size-1.5` (inline), `size-2` (header/logo), `size-2.5` (traffic lights).

### 6.2 Corner Ticks

`+` markers placed at each corner of a surface to evoke a film plate registration mark:

```tsx
<span aria-hidden="true" className="pointer-events-none absolute -top-1 -left-1 font-mono text-xs text-primary/70 select-none">+</span>
<span aria-hidden="true" className="pointer-events-none absolute -top-1 -right-1 font-mono text-xs text-primary/70 select-none">+</span>
<span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -left-1 font-mono text-xs text-primary/70 select-none">+</span>
<span aria-hidden="true" className="pointer-events-none absolute -bottom-1 -right-1 font-mono text-xs text-primary/70 select-none">+</span>
```

Used on: prompt composer, result stage plate. Lightbox uses `left-3 top-3` positioning.

### 6.3 Grain Overlay

Applied to `<body>` via `grain` class. A fixed full-viewport SVG noise overlay at 3% opacity with `mix-blend-mode: overlay`.

### 6.4 Scanlines

Applied to hero and result stage via `scanlines` class. Repeating linear gradient creating 2px transparent / 1px black horizontal lines at 4% opacity.

### 6.5 Bracket Frame

Hover effect for gallery cards. Lime corner brackets slide outward on hover:

```tsx
<figure className="bracket-frame group ...">
```

CSS uses `::before` / `::after` with 12px corner borders that animate opacity + position on hover.

### 6.6 Film Progress Bar

Animated diagonal stripe overlay for loading / generation states:

```tsx
<div className="film-progress h-1 border border-primary/30 opacity-80" />
```

Uses `film-march` animation (repeating 45° stripes at lime opacity).

### 6.7 Glow Lime

Box shadow effect for primary CTAs and active selections:

```css
.glow-lime {
  box-shadow:
    0 0 0 1px oklch(0.9 0.22 130 / 0.4),
    0 0 24px -4px oklch(0.9 0.22 130 / 0.35);
}
```

### 6.8 Sprocket Holes

Film-strip sprocket holes on the "How It Works" cards:

```tsx
<div
  aria-hidden="true"
  className="h-3 border-b border-border/60"
  style={{
    backgroundImage: "repeating-linear-gradient(to right, transparent 0 14px, oklch(0.06 0.008 240) 14px 22px)"
  }}
/>
```

### 6.9 Selection Highlight

```css
::selection {
  background-color: oklch(0.9 0.22 130 / 0.35);
  color: var(--foreground);
}
```

### 6.10 Auth Background

Radial gradient from lime to transparent:
```css
.auth-bg {
  background-image: radial-gradient(circle at 50% 0%, oklch(0.9 0.22 130 / 0.06) 0%, transparent 55%);
}
```

---

## 7. Animation

### Keyframe Animations

| Name            | Token                    | Description                          | Duration   |
|-----------------|--------------------------|--------------------------------------|------------|
| `fade-in`       | `animate-fade-in`        | Opacity 0→1                          | 0.3s ease-out |
| `fade-up`       | `animate-fade-up`        | Opacity 0→1 + translateY 8px→0      | 0.4s ease-out |
| `scale-in`      | `animate-scale-in`       | Opacity 0→1 + scale 0.97→1          | 0.2s ease-out |
| `cursor-blink`  | `animate-cursor-blink`   | Steps blink (live indicators)        | 1s infinite |
| `film-march`    | `animate-film-march`     | translateX stripe loop               | 1s linear infinite |
| `mask-wipe`     | `animate-mask-wipe`      | clip-path reveal left→right          | 0.9s cubic-bezier(0.7, 0, 0.2, 1) |

### Staggered Entrance

Hero elements use `animationDelay` with `animationFillMode: "both"`:
- Eyebrow → 0ms
- Headline line 1 → 120ms
- Headline line 2 → 420ms
- Terminal block → 600ms
- Sub-paragraph → 780ms
- Feature pills → 900ms
- CTAs → 1100ms
- Works-with strip → 1240ms

### Gallery Stagger

Image cards stagger with `animationDelay: ${index * 30}ms` using `animate-fade-up`.

### Scroll Reveal

`<Reveal>` component uses IntersectionObserver (threshold 0.15) with CSS transition:
```
opacity .6s ease, transform .6s ease
```

### Interactive Transitions

- Card hover: `transition-all duration-200 ease-out` with `-translate-y-0.5 shadow-md`
- Border color transitions: `transition-colors`
- Focus rings: `focus-visible:ring-[3px] focus-visible:ring-ring/50`

---

## 8. Icons

**Library:** Lucide React (`lucide-react`)

**Standard size:** `size-4` (16px) in buttons and UI elements, `size-3`–`size-3.5` for compact action buttons.

**Common icons used:**
- Navigation: `Sparkles`, `Library`, `KeyRound`, `Plug`, `Menu`, `ChevronUp`
- Actions: `Copy`, `Download`, `RefreshCcw`, `Bookmark`, `Trash2`, `Star`, `Shuffle`, `Dices`
- UI: `Moon`, `Sun`, `X`, `MoreHorizontal`, `Search`, `Check`, `LogOut`, `User`, `ShieldAlert`

---

## 9. Navigation Patterns

### Site Header (Landing)

- Sticky: `sticky top-0 z-40`
- Frosted glass: `bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60`
- Border: `border-b border-border/60`
- Logo: live dot + monospaced "Get Images" + divider + version tag

### Dashboard Sidebar

- Fixed 260px on desktop, Sheet on mobile
- Active link: `border-l-2 border-primary text-primary bg-accent/30` with bracket decoration `[ Label ]`
- Frame numbers on each nav item: `01`, `02`, `03`, `04`
- Usage meter at bottom with progress bar

### Dashboard Topbar

- Sticky: `sticky top-0 z-30 h-14`
- Frosted glass header with frame number + page title
- System status badge: `LIVE / SYS OK` with blinking dot
- User avatar dropdown

---

## 10. Page Patterns

### Landing Page Sections

Each landing section follows this structure:
1. `<section>` with `id`, `aria-labelledby`, `border-b border-border/60`
2. Container: `container mx-auto px-4 py-24 sm:px-6 lg:py-32`
3. Numbered header block (see Section Headers)
4. Content grid

### Dashboard Pages

Dashboard pages use:
- `p-6 sm:p-8` for page padding
- Page header: eyebrow + title + optional description
- Action buttons in the header row (top-right)
- Sticky filter bars for list pages

---

## 11. Accessibility

### Focus Management

```css
:focus-visible {
  @apply outline-2 outline-offset-2 outline-ring;
}
```

All interactive elements use `focus-visible:ring-[3px] focus-visible:ring-ring/50` or `focus-visible:ring-2 focus-visible:ring-ring/60`.

### Skip Link

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 ...">
  Skip to main content
</a>
```

### ARIA Patterns

- All decorative elements use `aria-hidden="true"`
- `role="list"` on styled `<ul>` elements
- `role="banner"` on headers, `role="contentinfo"` on footers
- `role="radio"` / `aria-checked` on chip selectors
- `role="switch"` / `aria-checked` on toggle buttons
- `role="progressbar"` with `aria-valuenow/min/max` on progress bars
- `role="img"` with `aria-label` on complex visual areas (result stage)
- `role="tablist"` / `role="tab"` / `aria-selected` on tab-like elements
- `aria-live="polite"` on character counters and status changes
- `aria-current="page"` on active navigation links
- `aria-label` on icon-only buttons and navigation landmarks

### Semantic Landmarks

- Navigation: `<nav aria-label="...">`
- Footers: `<footer role="contentinfo">`
- Sections: `<section aria-labelledby="...">`
- Dialogs: always include `DialogTitle` and `DialogDescription` (use `sr-only` if visually hidden)

---

## 12. Responsive Breakpoints

| Breakpoint | Width  | Key Changes                                     |
|------------|--------|--------------------------------------------------|
| Base       | 0+     | Single column, `px-4`, sidebar hidden            |
| `sm`       | 640px  | `px-6`, 2-column grids start                    |
| `md`       | 768px  | Sidebar visible, topbar adapts, nav links show   |
| `lg`       | 1024px | 3-column grids, hero splits to 7/5 grid         |
| `xl`       | 1280px | 4-column gallery                                 |

### Mobile Adaptations

- Sidebar → Sheet (slide from left)
- Navigation links → hidden (mobile nav sheet)
- Hero → stacked (single column)
- Gallery → 1 column → 2 → 3 → 4
- Filter bars wrap naturally with `flex-wrap`

---

## 13. Utility Reference

### Project-Specific Utilities (globals.css)

| Utility           | Effect                                                |
|--------------------|-------------------------------------------------------|
| `.grain`           | Full-viewport noise texture overlay (3% opacity)     |
| `.scanlines`       | Horizontal scan-line overlay (4% opacity)            |
| `.glow-lime`       | Lime box-shadow glow                                 |
| `.bracket-frame`   | Corner bracket hover effect                          |
| `.film-progress`   | Animated diagonal stripe progress bar                |
| `.auth-bg`         | Radial lime gradient background                      |
| `.card-interactive`| Hover lift + shadow transition                       |

### Tailwind Custom Extensions

| Token           | Maps To                    |
|-----------------|----------------------------|
| `font-sans`     | `--font-body`              |
| `font-display`  | `--font-display`           |
| `font-mono`     | `--font-mono`              |
| `radius-sm/md/lg/xl` | Derived from `--radius` (0.5rem base) |

---

## 14. Component Library

### shadcn/ui Components

Base primitives from shadcn/ui, customized to the Neo-Cinema aesthetic:

| Component       | File                          | Key Overrides                        |
|-----------------|-------------------------------|--------------------------------------|
| Button          | `ui/button.tsx`               | CVA variants, glow-lime additions    |
| Card            | `ui/card.tsx`                 | Standard shadcn                      |
| Badge           | `ui/badge.tsx`                | Rounded-none overrides in usage      |
| Input           | `ui/input.tsx`                | Standard shadcn                      |
| Textarea        | `ui/textarea.tsx`             | Standard shadcn                      |
| Dialog          | `ui/dialog.tsx`               | Custom `showCloseButton` prop        |
| Select          | `ui/select.tsx`               | Rounded-none overrides in usage      |
| Tabs            | `ui/tabs.tsx`                 | Line variant added                   |
| Table           | `ui/table.tsx`                | Standard shadcn                      |
| Tooltip         | `ui/tooltip.tsx`              | Standard shadcn                      |
| Sheet           | `ui/sheet.tsx`                | Used for mobile nav                  |
| Scroll Area     | `ui/scroll-area.tsx`          | Standard shadcn                      |
| Dropdown Menu   | `ui/dropdown-menu.tsx`        | Standard shadcn                      |
| Avatar          | `ui/avatar.tsx`               | Standard shadcn                      |
| Separator       | `ui/separator.tsx`            | Custom implementation                |
| Skeleton        | `ui/skeleton.tsx`             | Standard shadcn                      |
| Spinner         | `ui/spinner.tsx`              | Custom with Loader2, sm/md/lg sizes  |
| Mode Toggle     | `ui/mode-toggle.tsx`          | Sun/Moon with dropdown               |
| Sonner (Toasts) | `ui/sonner.tsx`               | `richColors position="top-right"`    |

### Utility Function

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { tailwind-merge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 15. Do's and Don'ts

### Do

- Use `font-mono uppercase tracking-[0.22em]` for all labels and metadata
- Use `rounded-none` for cinematic/dashboard elements
- Use `border-border/60` for subtle borders
- Use `bg-card/40` or `bg-background/40` for semi-transparent panels
- Use the live indicator dot for status/connection signals
- Use corner ticks (`+`) on important visual surfaces
- Use `glow-lime` on primary CTAs
- Pad numbers with leading zeros
- Use cinematic language: frames, plates, reels, runs, seeds
- Use numbered eyebrows on section headers
- Use `aria-hidden="true"` on all decorative elements
- Use `oklch()` for any custom color values

### Don't

- Don't use rounded corners on dashboard/cinematic elements (reserve for shadcn defaults only)
- Don't use colors outside the OKLCH token system
- Don't use decorative text without `aria-hidden="true"`
- Don't use body/sans font for labels — always monospaced
- Don't skip the uppercase treatment on metadata/labels
- Don't use generic loading states — use film-progress or scan-sweep patterns
- Don't use standard placeholder text — use cinematic microcopy
- Don't forget the grain overlay on the body
- Don't use `text-sm` for eyebrow labels — always `text-[10px]` or `text-[11px]`
