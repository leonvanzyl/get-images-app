# Workflow recipes

End-to-end worked examples for common image-generation tasks. Each recipe
shows the inferred decisions (model, ratio, prompt source, save path, optimize?)
and the actual MCP tool call sequence.

---

## 1. Next.js landing-page hero

**Context:** User is building a marketing landing page in Next.js. They say
"add a hero image to the top of the page."

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | Nano Banana Pro (`google:gemini-3-pro-image-preview`) | Customer-facing surface, quality matters         |
| Aspect ratio | 16:9                                            | Standard hero shape                                       |
| Thinking     | `deep`                                          | Customer-facing, no artifacts                            |
| Prompt       | Drafted from the headline + brand tone           | The page already says what it is — read it              |
| Save path    | `public/hero.webp`                              | Next.js convention; convert to WebP                       |
| Optimize?    | Yes — `optimize_for_web.py` with `--max-width 1920` | Web-bound, served at most ~2× display retina width |

**Tool calls:**

```
1. getimages_generate_image
     prompt: "<inferred from page copy>"
     modelId: "google:gemini-3-pro-image-preview"
     aspectRatio: "16:9"
     thinkingLevel: "deep"
2. curl -sSfL -o public/hero-source.png "<signed imageUrl>"
3. python .claude/skills/get-images/scripts/optimize_for_web.py \
     --input public/hero-source.png \
     --output public/hero.webp \
     --max-width 1920 --quality 82
4. <update <Image src="/hero.webp" .../> in app/page.tsx>
5. rm public/hero-source.png   # optional cleanup
```

---

## 2. MDX blog post inline image

**Context:** User is writing a blog post in MDX and wants an inline image after
the second paragraph.

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | Nano Banana (`google:gemini-2.5-flash-image`)   | Editorial / inline, doesn't need top-tier text rendering |
| Aspect ratio | 3:2                                             | Photographic feel for body content                       |
| Thinking     | n/a                                             | Model doesn't support it                                 |
| Prompt       | Drafted from the surrounding paragraphs         | The post tells you what to illustrate                    |
| Save path    | `content/posts/<slug>/cover.webp` or `public/blog/<slug>.webp` | Match the blog's existing convention      |
| Optimize?    | Yes — `optimize_for_web.py` with `--max-width 1200` | Body-column content is rarely wider than 800px display    |

**Tool calls:**

```
1. getimages_generate_image
     prompt: "<inferred from neighboring paragraphs>"
     modelId: "google:gemini-2.5-flash-image"
     aspectRatio: "3:2"
2. <download> + <optimize_for_web.py --max-width 1200>
3. ![Alt text](./cover.webp) in the MDX
```

Always set descriptive alt text — the model gives you no help there, write it
from the prompt.

---

## 3. E-commerce product card grid

**Context:** User has a product listing with 12 items and wants placeholder
images for each. They mention "fast and cheap."

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | GPT Image 1.5 or Nano Banana                    | User asked for fast + cheap                              |
| Aspect ratio | 1:1                                             | Standard product card                                    |
| Thinking     | n/a                                             |                                                          |
| Prompt       | One per product, drafted from the product name + category | The data is right there in the JSON / CMS    |
| Save path    | `public/products/<sku>.webp`                    | Mirror the product SKU                                   |
| Optimize?    | Yes — `optimize_for_web.py` with `--max-width 800` | Cards display at ~400px, 2x retina = 800           |

**Before kicking off:** call `getimages_get_account` once to confirm the
balance covers ~36 credits (12 images × 3 credits). Surface a heads-up to the
user: "About to spend ~36 credits on 12 placeholder shots — OK?" Don't batch
without confirmation.

**Tool calls (per product):**

```
1. getimages_generate_image
     prompt: "<inferred per product>"
     modelId: "google:gemini-2.5-flash-image"
     aspectRatio: "1:1"
2. <download> + <optimize_for_web.py --max-width 800>
```

---

## 4. Open Graph / social share card

**Context:** User wants an OG image for a page so it shows up nicely when
shared on Twitter/LinkedIn/Slack.

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | Nano Banana Pro                                  | OG cards are the user's "first impression" — quality matters; often need text rendering for the title overlay |
| Aspect ratio | 16:9                                            | Closest supported ratio to OG's 1.91:1                   |
| Thinking     | `deep` if rendering text directly, else `default` |                                                          |
| Prompt       | Page title + a few descriptive words            |                                                          |
| Save path    | `public/og.png` or `public/og/<slug>.png`       | OG cards: keep as PNG, **don't** WebP — many crawlers still don't render WebP previews |
| Optimize?    | **No.** Leave the PNG.                          | OG previews break on WebP across some major platforms    |

**Tool calls:**

```
1. getimages_generate_image
     prompt: "<inferred>"
     modelId: "google:gemini-3-pro-image-preview"
     aspectRatio: "16:9"
     thinkingLevel: "deep"
2. curl -sSfL -o public/og.png "<signed imageUrl>"
3. <add <meta property="og:image" content="/og.png" /> if not already there>
```

---

## 5. YouTube thumbnail

**Context:** User is writing the description for a YouTube video and wants a
matching thumbnail.

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | Nano Banana Pro                                  | Thumbnails compete for attention — quality matters; often need 2-4 words of readable text |
| Aspect ratio | 16:9                                            | YouTube standard                                          |
| Thinking     | `deep`                                          | High-stakes surface; especially if text is in the image  |
| Prompt       | Drafted from the video title + description      |                                                          |
| Save path    | wherever the user keeps video assets             | Often outside the repo — ask if unclear                  |
| Optimize?    | **No.** Keep the PNG full-resolution.            | YouTube re-encodes on upload — give it clean bytes       |

**Tool calls:**

```
1. getimages_generate_image
     prompt: "<inferred>"
     modelId: "google:gemini-3-pro-image-preview"
     aspectRatio: "16:9"
     thinkingLevel: "deep"
2. curl -sSfL -o <user-supplied path>/thumbnail.png "<signed imageUrl>"
```

---

## 6. Slide deck illustration

**Context:** User is putting together a slide deck and wants one illustration
per slide.

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | Nano Banana 2 (default thinking) or Nano Banana Pro | Internal deck → Banana 2; client-facing deck → Pro  |
| Aspect ratio | 16:9                                            | Modern slide format                                       |
| Thinking     | `deep` only if rendering text or a complex composition |                                                  |
| Prompt       | One per slide, drafted from the slide's title + bullets |                                                  |
| Save path    | next to the deck source — `slides/img/<n>.png` or similar |                                                  |
| Optimize?    | **No.** PowerPoint/Keynote/Google Slides handle their own compression. |                              |

---

## 7. App icon

**Context:** User wants an app icon for a desktop or mobile app.

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | Nano Banana Pro                                  | Icons are forever — single highest-fidelity attempt is worth the cost |
| Aspect ratio | 1:1                                             | Always                                                    |
| Thinking     | `deep`                                          | The composition must work at small sizes — tight framing matters |
| Prompt       | Drafted from the app concept; specify "centered, no text, simple background" |                                          |
| Save path    | `public/icon.png`, `src-tauri/icons/`, or framework-specific |                                                  |
| Optimize?    | **No.** Keep PNG. Use a dedicated favicon/app-icon generator to produce all required sizes from this master. |   |

**Note:** This skill produces one image. The user will typically need 8–20
sizes (16, 32, 48, 64, 128, 192, 256, 512, 1024, plus the Apple touch icon set
and Android adaptive variants). Hand off to a tool like `realfavicongenerator`,
`pwa-asset-generator`, or `electron-icon-builder` for the size matrix — don't
re-generate with the model at each size.

---

## 8. Infographic / poster

**Context:** User wants a single visual that conveys a stat, a process, or a
quote — often with readable text in the image.

**Inferred decisions:**

| Decision     | Value                                           | Why                                                      |
|--------------|-------------------------------------------------|----------------------------------------------------------|
| Model        | Nano Banana Pro                                  | Text rendering matters; other models can't be trusted with embedded text |
| Aspect ratio | 2:3 (portrait poster) or 3:2 (landscape) or 1:1 (Instagram-shareable) | Ask the user where it's going        |
| Thinking     | `deep`                                          | Always, for infographics                                  |
| Prompt       | Include the exact text in quotes; describe the style ("flat illustration, pastel palette, simple icons") |   |
| Save path    | user's choice — these are often not for the web | Ask                                                      |
| Optimize?    | **No.** Keep PNG, full resolution.               | These get printed, shared at full-rez, sometimes upscaled |

**Pro tip on text:** put the exact text in quotes inside the prompt
("…with the headline 'Ship faster.' centered at the top"). Don't expect the
model to read intent — be literal.

---

## Anti-recipes — what not to do

- **Don't generate at 1:1 and crop to 16:9 in code.** You waste pixels and
  the model composed for a square canvas. Generate at 16:9.
- **Don't run `optimize_for_web.py` on a YouTube thumbnail or OG card.** WebP
  breaks OG previews on some platforms and YouTube re-encodes anyway.
- **Don't loop `generate_image` to "try a few" without telling the user.** Each
  call burns credits. One generation, surface the result, ask if they want a
  retry.
- **Don't use deep thinking by default.** It costs more. Use it deliberately
  for high-stakes outputs.
- **Don't pass `thinkingLevel` to models that don't support it.** OpenAI models
  and Nano Banana (`gemini-2.5-flash-image`) reject the parameter.
