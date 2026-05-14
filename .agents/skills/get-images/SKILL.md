---
name: get-images
description: Generate, fetch, and optimize images via the Get Images MCP server. Use this skill whenever the user asks to create, generate, make, or produce an image, illustration, photo, thumbnail, hero image, banner, asset, or visual — especially when the Get Images MCP tools (getimages_generate_image, getimages_list_images, getimages_get_image, getimages_get_account, getimages_list_usage) are available. Also triggers on requests to "add an image to" a webpage/component, "create a thumbnail for", "generate stock photos", or any visual asset request in a coding project.
---

# Get Images

A skill for working with the Get Images MCP server: a hosted image-generation
service that exposes OpenAI's GPT Image models and Google's Gemini image models
through one MCP. Your job is to help the user end up with the right image, in
the right format, in the right place — not just to call the tool.

The MCP itself takes a prompt and returns image bytes plus a short-lived signed
URL. That's the easy part. The harder part is: **which model? what aspect ratio?
what should the prompt actually be? where does the file belong? should it be
WebP or PNG?** This skill is the playbook for those decisions.

## Available MCP tools

| Tool                          | Purpose                                                       | Billable?           |
|-------------------------------|---------------------------------------------------------------|---------------------|
| `getimages_generate_image`    | Generate a new image from a prompt                            | **Yes — spends credits** |
| `getimages_list_images`       | List the caller's previously generated images, newest first   | No                  |
| `getimages_get_image`         | Fetch metadata (and optionally bytes) for one image by ID     | No                  |
| `getimages_get_account`       | Return the caller's userId, email, and credit balance         | No                  |
| `getimages_list_usage`        | Return the caller's credit transaction history                | No                  |

`getimages_generate_image` is the only tool that costs credits. Every other tool
is free to call. The credits charged depend on the chosen model and whether
deep thinking was used — credit deductions are visible via `getimages_list_usage`.

## Before you generate: four decisions

Every successful generation hinges on four choices. Don't ask the user about
all four — that's annoying. **Infer the ones you reasonably can and ask only
when the context genuinely doesn't tell you.**

### 1. Model — usually ask, unless context decides

Five models are available. The differences matter:

| Model ID                                   | Friendly name        | Sweet spot                                                |
|--------------------------------------------|----------------------|-----------------------------------------------------------|
| `openai:gpt-image-1.5`                     | GPT Image 1.5        | Fast, cheap, everyday work                                |
| `openai:gpt-image-2`                       | GPT Image 2          | High-fidelity photorealism, premium OpenAI                |
| `google:gemini-2.5-flash-image`            | Nano Banana          | Friendly speed-to-quality balance                         |
| `google:gemini-3.1-flash-image-preview`    | Nano Banana 2        | Better coherence, optional deep thinking                  |
| `google:gemini-3-pro-image-preview`        | Nano Banana Pro      | Top-tier; excellent text rendering and complex scenes; supports 21:9 |

**Default behavior:** ask the user which model they want, presenting two or
three good candidates rather than the full list. Frame the tradeoff in plain
language — speed vs quality, cost vs fidelity.

**Skip the question when:**
- The user has already named a model in this conversation or a previous one ("use Nano Banana Pro" / "stick with gpt-image-2").
- The task obviously fits one model — e.g. "make a poster with these five lines of text" strongly points to Nano Banana Pro because of its text-rendering edge. Surface the choice (don't hide it) but don't make them pick.
- The user has indicated cost sensitivity — default to the cheaper option (GPT Image 1.5 or Nano Banana).

For deeper guidance see `references/models.md`.

### 2. Aspect ratio — usually infer, ask only when no layout exists

Supported ratios: `1:1`, `3:2`, `2:3`, `16:9`, `9:16`, `4:3`, `3:4`. **`21:9` is
Nano Banana Pro only.**

The right ratio is almost always implied by what the user is building. Look at
the surrounding code/copy before asking:

| Context cue                                       | Inferred ratio   |
|---------------------------------------------------|------------------|
| Full-bleed hero / landing-page banner             | 16:9 (or 21:9 for ultra-wide) |
| Side-by-side feature card with text on one half   | 4:3 or 3:2       |
| Mobile splash / phone-first launch screen         | 9:16             |
| Avatar, profile picture, app icon                 | 1:1              |
| Book cover, vertical poster, Pinterest pin        | 2:3              |
| Open Graph / social share card                    | 16:9 (close to 1.91:1 — best supported) |
| YouTube thumbnail                                 | 16:9             |
| Instagram square post                             | 1:1              |
| Instagram story / Reel cover                      | 9:16             |
| Blog inline image (responsive width)              | 3:2 or 16:9      |

Only ask when none of these apply — e.g. "make me a picture of a corgi" with no
other context.

For unusual layouts see `references/aspect-ratios.md`.

### 3. Prompt — propose, don't beg

If the user gave you the prompt verbatim, use it. If they said "add a hero
image" or "we need a thumbnail for this video", **draft a prompt yourself**
from the surrounding context: page copy, brand tone, headings, color words,
mood. Then either run it or surface it to the user for a one-line confirm.

Asking "what should the prompt be?" when you've just been staring at the user's
landing page is a wasted round trip. A good proposal looks like:

> I'll generate something like "a sunlit modern home office, warm cream walls,
> macbook on a wooden desk, indoor plant, soft natural light, photographic" —
> matches the calm tone of your hero copy. OK to run with that?

If the user already told you the visual concept ("a photo of a coral bloom on a
neutral background, studio-lit"), just run it.

When the user says "look at the page and decide for yourself," do exactly that —
don't bounce the question back.

### 4. Storage location — infer from the project, ask if ambiguous

The MCP returns a signed URL pointing at the generated image. You'll need to
download the bytes to a real path. Where that path lives depends on the
project's tech stack — read the directory structure before asking:

| Project signal                                | Save to                                    |
|-----------------------------------------------|--------------------------------------------|
| `next.config.{js,ts}` / `app/` directory      | `public/` (top-level) — referenced as `/whatever.png` |
| `vite.config.*` + React/Vue/Svelte            | `public/`                                  |
| `astro.config.*`                              | `src/assets/` (imported) or `public/` (referenced)  |
| `nuxt.config.*`                               | `public/`                                  |
| Static HTML site / no framework               | `assets/` or `images/`                     |
| Markdown blog (MDX, Hugo, Jekyll)             | next to the post, or in `content/<slug>/`  |
| Tauri / Electron desktop app                  | `src-tauri/icons/` or `public/`            |
| Mobile (React Native / Expo)                  | `assets/`                                  |
| Notebook or scratch work                      | working directory                          |

Use a descriptive filename, not the UUID returned by the MCP — `coral-hero.png`
beats `b3f8a2…png` every time. If the project has a naming convention already
(kebab-case, snake_case), follow it.

If the user is working in an unfamiliar shape — a custom monorepo, a backend
service with no obvious asset folder — **ask once and remember the answer for
the rest of the conversation.**

## Then: pick the output format

Once you know what you're generating, you also know what format the user needs.
The Get Images MCP returns PNGs (or whatever the provider emits). Whether to
keep that PNG or convert it depends on the destination:

| Destination                                          | Format                          | Action                                                          |
|------------------------------------------------------|---------------------------------|-----------------------------------------------------------------|
| Web page (hero, blog inline, product card, OG card)  | **WebP**, quality ~82, resized to actual display width | Run `scripts/optimize_for_web.py` after download                 |
| Poster, infographic, print piece                     | Keep PNG, full resolution       | No optimization step                                            |
| Video thumbnail (YouTube, TikTok, podcast)           | Keep PNG, full resolution       | Platforms compress on upload — give them clean bytes            |
| App icon / favicon set                               | Keep PNG, full resolution; you'll often need multiple sizes generated downstream | No optimization step in this skill — use a dedicated favicon generator |
| Social media post (Instagram, X, LinkedIn)           | Keep PNG                        | The platform recompresses; don't double-compress                |
| Email graphic                                        | JPEG or WebP at quality ~80     | `optimize_for_web.py` with a target `--max-width 800` is fine   |
| Notebook / one-off / "just show me"                  | Keep PNG                        | No optimization step                                            |

**The default for "this image goes on a website" is WebP.** The default for
everything else is "leave the PNG alone."

## The standard flow

1. **(Optional) Check credits.** For batch jobs or expensive models, call
   `getimages_get_account` first to confirm the user has enough budget. For a
   single image, this is overkill — skip it.
2. **Generate.** Call `getimages_generate_image` with `prompt`, `modelId`,
   `aspectRatio`, and (if the chosen model supports it) `thinkingLevel`.
3. **Read the signed URL.** The response includes `structuredContent.imageUrl`
   — a signed HTTPS URL that expires in **15 minutes**. The MCP also returns the
   bytes inline as a base64 image content block; agents can use either, but the
   URL is usually friendlier on context cost.
4. **Download to the target path.** A one-liner is enough:

   ```bash
   curl -sSfL -o public/coral-hero.png "$IMAGE_URL"
   ```

   or in Python: `urllib.request.urlretrieve(image_url, "public/coral-hero.png")`.

5. **Optimize if web-bound.** If the destination is a webpage:

   ```bash
   python .claude/skills/get-images/scripts/optimize_for_web.py \
     --input public/coral-hero.png \
     --output public/coral-hero.webp \
     --max-width 1920 \
     --quality 82
   ```

   The script preserves the aspect ratio, strips metadata, and reports the file
   size delta.

6. **Wire it into the code.** Update the `<Image src=…>` / `<img src=…>` /
   `background-image: url(…)` reference. If you switched to WebP, delete the
   intermediate PNG only after confirming the WebP is good.

## Thinking levels

Only two models accept a `thinkingLevel` parameter:

- `google:gemini-3.1-flash-image-preview`
- `google:gemini-3-pro-image-preview`

The UI exposes two values: `default` (fast, cheap) and `deep` (slower, smarter).
Deep thinking costs more credits than the base rate for that model.

Use `deep` when:
- The prompt has multiple subjects that need to coexist coherently (e.g. "a cat
  and a dog playing chess on a marble table while a flamingo watches").
- The image must contain readable text — signs, labels, titles, posters.
- The composition is tight (specific framing, specific positions, specific
  perspective).
- The first attempt with `default` came out clearly wrong and the user is
  pushing for a better result.

Otherwise, leave it off. For models without thinking support, **omit the
parameter entirely** — sending it produces a server error.

## Errors and recovery

- **Insufficient credits.** Surface the error to the user with the exact balance
  and the direct link to top up (`/pricing` on the Get Images app). Do not
  retry. Do not silently switch models.
- **Signed URL expired.** The URL lives 15 minutes. If the agent waited too
  long (long conversation, lots of intermediate steps), call
  `getimages_get_image` with the image ID and `includeBytes: true` — the
  response carries a fresh signed URL plus the bytes.
- **Provider failure / safety block.** If a generation fails for content
  reasons, surface the provider's message verbatim — don't paraphrase. Ask the
  user if they want to retry with an adjusted prompt; don't guess at the
  rewording yourself.
- **Slow generation.** Premium models (Nano Banana Pro on `deep`, GPT Image 2)
  can take 60+ seconds. The MCP emits progress notifications during the wait;
  most clients render these as "still generating…" automatically. Don't time
  out client-side and retry — that would re-spend credits.

## When to consult the references

This file covers ~90% of cases. Reach for the references when:

- **Choosing between models for a non-obvious case** → `references/models.md`.
  Has a side-by-side capability matrix, cost notes, and "use when" examples for
  each model.
- **An unusual aspect ratio is needed** (custom layout, ultra-wide hero,
  vertical print piece) → `references/aspect-ratios.md`.
- **You want an end-to-end worked example** for a specific scenario (Next.js
  hero, MDX blog post, YouTube thumbnail, OG card, etc.) →
  `references/workflows.md`. Each recipe shows the inferred decisions and the
  exact tool calls.

## What this skill won't do

- **Won't pick a model silently.** When the user hasn't specified one and the
  task isn't obviously model-specific, surface the choice with two or three
  candidates and a one-line tradeoff. Generating with the wrong model wastes
  credits.
- **Won't upscale.** Get Images doesn't offer an upscaling endpoint. If the
  user needs more pixels than the model produced, recommend a dedicated
  upscaler (Topaz, Real-ESRGAN, etc.) rather than re-running.
- **Won't fight the user on retries.** If the first generation is wrong and the
  user wants to try again, do that. Tweak one variable at a time — usually the
  prompt — so the user can see what changed.
