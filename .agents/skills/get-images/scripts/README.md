# Scripts

Helper scripts for working with images generated via the Get Images MCP.

## `optimize_for_web.py`

Converts a PNG/JPEG/WebP image to WebP, optionally resizing and stripping
metadata. Use this whenever the generated image is destined for a webpage,
blog, email graphic, or any context where file size matters more than
pixel-perfect fidelity.

**Requires:** Python 3.9+ and Pillow (`pip install Pillow`).

**Use when:**
- Saving a hero image to `public/` for a Next.js / Vite / Astro / Nuxt site.
- Inserting an inline image into a blog post (Markdown, MDX, Hugo, Jekyll).
- Generating product card images for an e-commerce grid.
- Producing email graphics that need to be small.

**Don't use when:**
- The image is a **YouTube thumbnail** — YouTube re-encodes on upload, so a
  fresh PNG is better.
- The image is an **Open Graph / Twitter card** — some crawlers don't render
  WebP previews. Keep it PNG.
- The image is a **poster, infographic, or print piece** — you want full
  resolution and pixel fidelity, not file-size savings.
- The image is an **app icon or favicon** — use a dedicated favicon generator
  to produce the full size matrix.
- The image is a **social media post** — platforms re-compress, so feeding
  them a fresh PNG avoids double compression.

**Common invocations:**

```bash
# Hero image: cap at 1920px, default quality, strip metadata
python optimize_for_web.py --input public/hero-source.png \
  --output public/hero.webp --max-width 1920

# Blog inline image: narrower content column, smaller cap
python optimize_for_web.py --input post-cover.png --max-width 1200

# Lossless WebP for a UI screenshot or diagram (line art, sharp edges)
python optimize_for_web.py --input ui-screenshot.png --lossless

# Custom quality for an email graphic where size matters more than detail
python optimize_for_web.py --input promo.png --max-width 800 --quality 70
```

The script prints the input size, output size, and savings percentage — handy
for confirming the optimization actually helped before deleting the source.
