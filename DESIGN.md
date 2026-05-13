# Get Images — Design System

> **Open Studio** — A friendly, modern aesthetic built for vibe coders and AI agents.
> Calm warm-cream canvas, one distinctive coral accent, soft serifs paired with a clean geometric sans.
> The work is the hero. Chrome is quiet. Nothing flashes, blinks, or shouts.

---

## 1. Theme Identity

**Name:** Open Studio
**Default mode:** Light (warm cream)
**Dark mode:** Soft inversion (warm charcoal, not pure black)
**Managed by:** `next-themes` with `attribute="class"` and `defaultTheme="light"`

### Personality

- Calm, warm, modern — the opposite of a generic SaaS dashboard
- Generous whitespace and rounded corners over dense chrome
- One personality color (coral) used sparingly — not splashed everywhere
- Sentence case, friendly microcopy ("What should we make?" not "COMPOSE PROMPT")
- Function over decoration — every element earns its place

### Design Anti-Patterns We Avoid

- No grain overlays, scanlines, or film-strip motifs
- No corner ticks, sprocket holes, or bracket frames
- No uppercase monospace labels on every surface
- No blinking "live" dots or rotating frame counters
- No sharp `rounded-none` cards — soft corners throughout
- No flashing animation chains on page load — entrance is calm

---

## 2. Color System

All colors use **OKLCH**. Tokens are defined as CSS custom properties on `:root` / `.light` / `.dark` in `globals.css` and mapped to Tailwind via `@theme inline`.

### Light Mode (Canonical)

| Token                    | OKLCH Value                | Role                                |
|--------------------------|----------------------------|-------------------------------------|
| `--background`           | `oklch(0.985 0.008 80)`   | Warm cream page background          |
| `--foreground`           | `oklch(0.22 0.015 60)`    | Espresso ink — primary text         |
| `--card`                 | `oklch(1 0 0)`            | Pure white panel — pops slightly    |
| `--card-foreground`      | `oklch(0.22 0.015 60)`    | Espresso ink                        |
| `--primary`              | `oklch(0.7 0.17 35)`      | **Coral accent** — single hero color |
| `--primary-foreground`   | `oklch(0.99 0.005 80)`    | Near-white on coral                 |
| `--secondary`            | `oklch(0.95 0.012 80)`    | Softer cream panel                  |
| `--secondary-foreground` | `oklch(0.22 0.015 60)`    | Espresso                            |
| `--muted`                | `oklch(0.94 0.01 80)`     | Subdued surface                     |
| `--muted-foreground`     | `oklch(0.48 0.012 60)`    | Secondary text                      |
| `--accent`               | `oklch(0.93 0.015 80)`    | Hover / selected surface            |
| `--destructive`          | `oklch(0.6 0.2 25)`       | Error red                           |
| `--border`               | `oklch(0.9 0.01 80)`      | Hairline divider                    |
| `--input`                | `oklch(1 0 0)`            | Input bg = white                    |
| `--ring`                 | `oklch(0.7 0.17 35)`      | Coral focus ring                    |

### Dark Mode (Warm Inversion)

| Token                  | OKLCH Value                | Role                                |
|------------------------|----------------------------|-------------------------------------|
| `--background`         | `oklch(0.16 0.008 60)`    | Warm charcoal (not pure black)      |
| `--foreground`         | `oklch(0.96 0.005 80)`    | Warm white                          |
| `--card`               | `oklch(0.2 0.008 60)`     | Slightly raised panel               |
| `--primary`            | `oklch(0.78 0.16 35)`     | Coral, lifted for contrast          |
| `--muted-foreground`   | `oklch(0.7 0.008 60)`     | Soft warm gray                      |
| `--border`             | `oklch(0.28 0.008 60)`    | Subtle divider                      |

### Chart Palette

Five chart colors warmed up: coral, sage, amber, plum, sky. Defined `--chart-1` through `--chart-5`.

### Opacity Conventions

- Borders typically at full strength (`border-border`), not `/60`
- Muted text uses `text-muted-foreground` — no `/40` shenanigans
- The coral accent is **never** translucent on text — keep it solid

---

## 3. Typography

### Font Stack

| Slot      | Font                | CSS Variable      | Notes                                          |
|-----------|---------------------|-------------------|------------------------------------------------|
| Display   | **Fraunces**        | `--font-display`  | Variable serif. Soft, characterful, modern.    |
| Body      | **Geist**           | `--font-body`     | Geometric sans (Vercel). Crisp, technical.     |
| Mono      | **JetBrains Mono**  | `--font-mono`     | Code, API keys, model IDs only.                |

All loaded via `next/font/google` with `display: "swap"`.

**Why this pairing:** Fraunces' optical-sizing axis gives headlines a soft, almost editorial warmth — the opposite of a tech-bro grotesk. Geist keeps the UI crisp and technical (audience: developers). JetBrains Mono is reserved for code and identifiers — **not** UI labels.

### Type Scale

| Pattern              | Class                                                                         |
|----------------------|-------------------------------------------------------------------------------|
| Hero headline        | `font-display text-5xl font-medium tracking-tight md:text-6xl lg:text-7xl`    |
| Page title           | `font-display text-3xl font-medium tracking-tight md:text-4xl`                |
| Section heading      | `font-display text-2xl font-medium tracking-tight md:text-3xl`                |
| Card title           | `font-display text-lg font-medium`                                            |
| Body large           | `text-lg leading-relaxed text-muted-foreground`                               |
| Body                 | `text-sm leading-relaxed` (UI), `text-base leading-relaxed` (content)         |
| Label                | `text-sm font-medium text-foreground`                                         |
| Metadata             | `text-xs text-muted-foreground`                                               |
| Code / model ID      | `font-mono text-xs text-muted-foreground`                                     |

### Typography Rules

- **Sentence case everywhere.** Never `UPPERCASE` for UI labels.
- **No letter-spacing tricks.** Default tracking (or `tracking-tight` for display).
- **Display font for headlines and titles only** — never body text.
- **Mono font for code-like values only** — model IDs, API keys, image dimensions. Never for normal labels.
- **No leading-zero padding** on counters (`5 credits`, not `005`).
- **Italics are allowed and encouraged** for display headlines — Fraunces' italic axis is one of its strengths.

---

## 4. Spacing & Layout

### Container

```
container mx-auto max-w-6xl px-6 sm:px-8
```

Most content sits inside `max-w-6xl`. Marketing content can stretch to `max-w-7xl`. Dashboard content prefers `max-w-5xl` for comfortable reading.

### Section Spacing

| Pattern              | Classes                            |
|----------------------|------------------------------------|
| Section vertical     | `py-20 md:py-28`                   |
| Card padding         | `p-6` (default), `p-8` (emphasis)  |
| Stack gap (vertical) | `space-y-6` content, `space-y-3` form fields |
| Between sections     | No hard borders — use whitespace   |

### Dashboard Layout

```
min-h-screen md:grid md:grid-cols-[240px_1fr]
```

- Sidebar: 240px on desktop, full-screen sheet on mobile
- No sticky topbar by default. Page header lives inline at the top of each page.
- Pages get `px-8 py-10 md:px-12 md:py-12` for breathing room.

### Radius

Base radius: `0.75rem` (12px).

| Element              | Radius                  | Class            |
|----------------------|-------------------------|------------------|
| Buttons              | 10px                    | `rounded-[10px]` |
| Inputs / selects     | 10px                    | `rounded-[10px]` |
| Cards / panels       | 16px                    | `rounded-2xl`    |
| Dialogs              | 20px                    | `rounded-[20px]` |
| Pills / chips        | full                    | `rounded-full`   |
| Avatars              | full                    | `rounded-full`   |
| Images in gallery    | 12px                    | `rounded-xl`     |

**Never use `rounded-none`** anywhere except for full-bleed sections.

---

## 5. Component Patterns

### 5.1 Buttons

**Source:** `src/components/ui/button.tsx`

| Variant       | Usage                                              | Look                                              |
|---------------|----------------------------------------------------|---------------------------------------------------|
| `default`     | Primary action                                     | Coral bg, white text, soft shadow                 |
| `secondary`   | Alt action on cards                                | Subtle cream/charcoal bg, foreground text         |
| `outline`     | Tertiary                                           | 1px border, transparent bg                        |
| `ghost`       | Lightweight, inline                                | No border, hover bg only                          |
| `destructive` | Danger                                             | Red bg, white text                                |
| `link`        | Text link                                          | Underline on hover                                |

**Sizes:** `sm` (h-8 px-3), `default` (h-10 px-4), `lg` (h-11 px-6).

**Standard button:**
```tsx
<Button>Generate image</Button>
```

**Primary CTA (with arrow):**
```tsx
<Button size="lg" className="gap-2">
  Generate
  <ArrowRight className="size-4" />
</Button>
```

- Buttons get a soft hover lift: `hover:shadow-sm transition-shadow`
- No `glow-lime` style. Coral primary is enough.
- No `rounded-none`. Always `rounded-[10px]`.

### 5.2 Cards & Panels

**Standard card:**
```tsx
<div className="rounded-2xl border bg-card p-6 shadow-sm">
  ...
</div>
```

- `bg-card` (white in light, raised charcoal in dark)
- `border` (single hairline, full strength)
- `shadow-sm` for subtle depth (never `shadow-lg` except on dialogs)
- `p-6` standard, `p-8` for emphasis

**Section dividers:** Use whitespace and headings, not visible borders.

### 5.3 Section Headers

```tsx
<header className="space-y-2">
  <h1 className="font-display text-3xl font-medium tracking-tight">
    Your library
  </h1>
  <p className="text-muted-foreground">
    Every image you've made. Filter, favorite, regenerate.
  </p>
</header>
```

No eyebrows. No numbered prefixes. No left lime borders. Just a title and a friendly subtitle.

### 5.4 Forms & Inputs

**Input:**
```tsx
<Input className="h-10 rounded-[10px]" placeholder="Describe an image..." />
```

- `h-10` standard. `h-9` for compact contexts.
- `rounded-[10px]` always.
- Placeholder uses friendly sentence-case copy.
- Focus ring: 2px coral with `focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2`.

**Textarea (prompt composer):**
```tsx
<Textarea
  className="min-h-[120px] resize-none rounded-2xl border bg-card p-4 text-base leading-relaxed shadow-sm"
  placeholder="What should we make?"
/>
```

The prompt input is the hero on the generation page — it gets the larger card-like treatment.

### 5.5 Chips / Pills (for option selection)

Used for aspect ratio, style preset, reasoning level:

```tsx
<button
  className={cn(
    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
    selected
      ? "border-primary bg-primary/10 text-primary"
      : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
  )}
>
  16:9
</button>
```

- Rounded full
- Selected state uses `bg-primary/10` + `text-primary` + `border-primary`
- No glow. No uppercase. No mono.

### 5.6 Badges

```tsx
<Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">
  New
</Badge>
```

Status badges use solid color at `/10` opacity with foreground text in the same hue. Always pill-shaped.

### 5.7 Tables

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b text-left text-xs font-medium text-muted-foreground">
      <th className="py-3 pr-4">Name</th>
      ...
    </tr>
  </thead>
  <tbody>
    <tr className="border-b last:border-0 hover:bg-accent/50">
      ...
    </tr>
  </tbody>
</table>
```

- Hairline borders between rows
- Hover row gets subtle accent bg
- No left-border accents, no mono headers

### 5.8 Dialogs

```tsx
<DialogContent className="rounded-[20px] border bg-card p-8 sm:max-w-md">
  <DialogTitle className="font-display text-2xl font-medium tracking-tight">
    New key
  </DialogTitle>
  <DialogDescription className="text-muted-foreground">
    Give it a memorable name.
  </DialogDescription>
  ...
</DialogContent>
```

- Larger radius (20px)
- Display font for the title
- Sentence case
- No frame markers, no "01 / 02"

### 5.9 Empty States

```tsx
<div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
  <p className="font-display text-xl font-medium">Nothing here yet</p>
  <p className="mt-2 text-sm text-muted-foreground">
    Generate your first image to get started.
  </p>
  <Button className="mt-6">Start generating</Button>
</div>
```

Dashed border + warm copy + action button. No "— empty reel —" cinematic language.

---

## 6. Visual Details

These are the *only* decorative effects we use. Everything else has been removed.

### 6.1 Soft Shadow

The single shadow language across the app:

```css
.shadow-sm  /* card resting */
.shadow-md  /* hover or floating */
.shadow-lg  /* dialogs, popovers */
```

No custom box-shadow values. No glow colors.

### 6.2 Coral Wash

Selected/active states get a 10% wash of primary:

```
bg-primary/10 text-primary border-primary
```

That's it. No other color is allowed for "selected" state.

### 6.3 Background Gradient (Marketing Only)

The landing-page hero gets a single subtle radial gradient — applied to a single element, not the whole body:

```css
.hero-glow {
  background-image: radial-gradient(
    ellipse at 50% 0%,
    oklch(0.7 0.17 35 / 0.08) 0%,
    transparent 60%
  );
}
```

Apply sparingly. Dashboard pages get **no** decorative gradients.

### 6.4 Selection Color

```css
::selection {
  background-color: oklch(0.7 0.17 35 / 0.25);
  color: var(--foreground);
}
```

---

## 7. Animation

### Principles

- **One entrance animation on initial load, max.** No staggered choreography.
- **Hover transitions** belong on interactive elements (buttons, cards, links).
- **No infinite animations.** No `cursor-blink`, no `film-march`, no scanning sweeps.

### Available Keyframes

| Name        | Token              | Use                              | Duration                   |
|-------------|--------------------|--------------------------------- |----------------------------|
| `fade-in`   | `animate-fade-in`  | Initial mount, single elements   | 0.3s ease-out              |
| `fade-up`   | `animate-fade-up`  | Page sections on first paint     | 0.4s ease-out              |

### Loading States

While generating an image, show:
1. A **soft pulsing skeleton** (`animate-pulse` from Tailwind) on the result panel
2. A simple progress label below: "Cooking your image…"

No marching stripe bars. No scan sweeps. Tailwind's built-in `animate-pulse` is enough.

### Hover

- Buttons: `transition-colors duration-150`
- Cards (interactive): `transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5`
- Links: `transition-colors`

### Page Transitions

None. Next.js handles route changes natively — no custom transition layer.

---

## 8. Icons

**Library:** Lucide React (`lucide-react`)

**Standard sizes:**
- `size-4` (16px) — inline UI
- `size-5` (20px) — buttons
- `size-6` (24px) — section headers and feature cards

**Stroke:** Default 2 (don't override).

**No coral-tint trick.** Icons inherit `currentColor` from their parent text color.

---

## 9. Navigation

### Site Header (Landing)

- **Position:** Sticky `top-0 z-40`
- **Background:** `bg-background/80 backdrop-blur`
- **Height:** `h-16`
- **Border:** Single 1px hairline `border-b`
- **Content:** Logo on left, nav links centered (md+), CTA on right
- **No** version tag, no blinking dot, no frame markers

```tsx
<header className="sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur">
  <div className="container mx-auto flex h-full max-w-6xl items-center justify-between px-6">
    <Logo />
    <nav className="hidden gap-8 md:flex">...</nav>
    <Button>Sign in</Button>
  </div>
</header>
```

### Dashboard Sidebar

- **Width:** 240px
- **Background:** `bg-card` (a touch lighter than page bg in light, raised in dark)
- **No border on right** — uses subtle background contrast instead
- **Nav item:** Plain text + icon, no frame number, no bracket on active

```tsx
<Link
  href="/dashboard/library"
  className={cn(
    "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-foreground"
  )}
>
  <Library className="size-4" />
  Library
</Link>
```

### No Topbar

The dashboard no longer has a global topbar. Each page renders its own inline header (title + description + actions). The sidebar holds the user menu and credit balance.

---

## 10. Page Patterns

### Landing Page

1. **Hero** — Big display headline, supporting copy, two CTAs ("Try it" + "Read the docs")
2. **How it works** — Three steps in a 3-column grid. Cards with icon + title + 1 sentence.
3. **Examples** — Masonry grid of generations. No corner ticks.
4. **CTA** — Single panel, gradient wash, single button.

No "01 — SECTION" eyebrows. Section titles are display-font H2s with friendly subtitles.

### Dashboard Pages

Every dashboard page follows:

```tsx
<div className="px-8 py-10 md:px-12 md:py-12">
  <header className="mb-10 flex items-end justify-between gap-4">
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Page title
      </h1>
      <p className="text-muted-foreground">Short, friendly subtitle.</p>
    </div>
    <div className="flex gap-2">{/* page actions */}</div>
  </header>

  {/* page content */}
</div>
```

---

## 11. Accessibility

- All interactive elements get `focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2`
- Decorative elements get `aria-hidden="true"`
- Skip link remains: `<a href="#main-content" className="sr-only focus:not-sr-only ...">`
- Form labels are real `<Label>` elements, not placeholder-only
- Color contrast: foreground on background hits AAA in both modes (verified for coral too)

---

## 12. Responsive Breakpoints

| Breakpoint | Width   | Behavior                                            |
|------------|---------|-----------------------------------------------------|
| Base       | 0+      | Single column, sidebar → sheet, headlines `text-5xl` |
| `sm`       | 640px   | `px-8`, comfortable padding                          |
| `md`       | 768px   | Sidebar visible, nav links shown                     |
| `lg`       | 1024px  | Multi-column grids, hero hits `text-7xl`             |
| `xl`       | 1280px  | Library grid → 4 columns                             |

---

## 13. Utility Reference

### Project Utilities (globals.css)

| Utility            | Effect                                              |
|--------------------|-----------------------------------------------------|
| `.hero-glow`       | Single soft coral radial gradient (hero only)       |
| `.card-interactive`| Hover lift + shadow transition for clickable cards  |

**That's it.** All cinematic utilities (grain, scanlines, glow-lime, bracket-frame, film-progress, sprocket) have been removed.

### Tailwind Custom Extensions

| Token           | Maps To                    |
|-----------------|----------------------------|
| `font-sans`     | `--font-body` (Geist)      |
| `font-display`  | `--font-display` (Fraunces)|
| `font-mono`     | `--font-mono` (JetBrains)  |

---

## 14. Image Model Capability Map

Different models support different parameters. The UI must adapt per model.

| Model                              | Common aspect ratios                                | Extra ratios | Thinking      | Seed |
|-------------------------------------|----------------------------------------------------|--------------|---------------|------|
| OpenAI gpt-image-1.5                | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4                 | —            | —             | —    |
| OpenAI gpt-image-2                  | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4                 | —            | —             | —    |
| Gemini 2.5 Flash Image              | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4                 | —            | —             | —    |
| Gemini 3.1 Flash Image (Banana 2)   | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4                 | —            | default/deep  | —    |
| Gemini 3 Pro Image (Banana Pro)     | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4                 | 21:9         | default/deep  | —    |

**Rules:**
- **Seed is removed entirely** — neither OpenAI image models nor Gemini image models accept seed as a parameter. The UI no longer collects it.
- **Reasoning ("Deeper thinking") UI appears only when the selected model declares thinking support** — otherwise the control is hidden.
- **Aspect ratios** are constrained to the selected model's declared list. The common seven ratios cover all five models; Gemini 3 Pro additionally supports 21:9.

Capabilities are declared in `src/services/image-generation/models.ts` on each `ImageModelDefinition`:

```ts
type ImageModelDefinition = {
  id: string
  providerId: ProviderId
  modelId: string
  name: string
  description: string
  aspectRatios: AspectRatio[]
  thinking?: {
    default: "low" | "minimal"
    deep: "high"
  }
}
```

### Thinking → Provider mapping

The UI exposes a single toggle: **default** (fast, cheap) vs **deep** (slower, smarter).

| Model                      | UI "default" → API value | UI "deep" → API value |
|----------------------------|--------------------------|------------------------|
| Gemini 3.1 Flash Image     | `minimal`                | `high`                 |
| Gemini 3 Pro Image         | `low`                    | `high`                 |

For models without thinking support, the toggle isn't rendered at all.

---

## 15. Credit Pricing

Packs (defined in `src/lib/polar.ts` and `src/app/(site)/pricing/page.tsx`):

| Pack    | Credits | USD    | $/credit  |
|---------|---------|--------|-----------|
| Starter | 100     | $5.00  | $0.050    |
| Plus    | 500     | $22.50 | $0.045    |
| Pro     | 1200    | $48.00 | $0.040    |

### Per-model credit cost (and deep-thinking surcharge)

Defined in `scripts/seed-model-pricing.ts` and stored in `model_pricing` table. The `creditCost` column is the **base** cost. The new `thinking_high_credit_cost` column is the cost when the user selects "deep" thinking (only relevant for thinking-capable models).

| Model                              | Base credits | Deep-thinking credits | Real cost (USD) | Approx. margin |
|------------------------------------|--------------|------------------------|-----------------|----------------|
| OpenAI gpt-image-1.5               | 3            | —                      | ~$0.05          | ~58%           |
| OpenAI gpt-image-2                 | 5            | —                      | ~$0.06–$0.21    | 30–70%         |
| Gemini 2.5 Flash Image             | 3            | —                      | $0.039          | ~67%           |
| Gemini 3.1 Flash Image             | 5            | 7                      | $0.067 / +tokens | ~66–71%       |
| Gemini 3 Pro Image                 | 12           | 18                     | $0.134 / ~$0.20  | ~66–72%       |

Margins computed at the Pro pack rate ($0.04/credit) — the worst case.

When a generation runs with deep thinking, the server reads `thinking_high_credit_cost` from `model_pricing`. If absent (i.e. the model has no thinking support), it falls back to the base `creditCost`.

---

## 16. Do's and Don'ts

### Do

- Use Fraunces for headlines, Geist for UI, JetBrains Mono for code-like values only
- Use sentence case for everything (titles, buttons, labels, microcopy)
- Use the coral primary sparingly — selected states, primary buttons, links
- Use rounded corners (`rounded-[10px]`, `rounded-2xl`, `rounded-full`)
- Use generous whitespace — let content breathe
- Use friendly microcopy ("What should we make?", "Nothing here yet")
- Use Tailwind's built-in `animate-pulse` for loading states
- Show reasoning-level UI **only** for models that support it
- Adapt aspect-ratio options per model's declared capabilities

### Don't

- Don't use `rounded-none` (cinematic sharp edges are gone)
- Don't use `UPPERCASE` for UI labels, ever
- Don't use mono font for non-code UI text
- Don't add glow, blinking dots, scanlines, grain, brackets, sprockets, frame markers
- Don't write copy like "frame 003 of 500", "compose · render · refine", "live"
- Don't use letter-spacing tracking values like `[0.22em]`
- Don't add a sticky topbar on dashboard pages — each page owns its header
- Don't expose seed in the UI — no current model uses it
- Don't show reasoning UI for models that don't support thinking
- Don't add infinite animations (`cursor-blink`, `film-march`, etc.)
- Don't fight the design system in the name of "visual interest" — restraint is the language
