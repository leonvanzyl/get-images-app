# Aspect ratio reference

Supported ratios across all models:
`1:1`, `3:2`, `2:3`, `16:9`, `9:16`, `4:3`, `3:4`.

**21:9 is Nano Banana Pro only** (`google:gemini-3-pro-image-preview`).

Picking the right ratio matters more than people realize. The same prompt at
1:1 vs 16:9 produces very different framings — the model composes for the
canvas it's given. Choose the ratio that matches the final placement, not the
one closest to "default."

## At a glance

| Ratio | Common use cases                                                 | Don't use for                              |
|-------|------------------------------------------------------------------|---------------------------------------------|
| 1:1   | Avatars, profile pictures, app icons, Instagram square posts, album covers, podcast art | Wide hero banners, mobile-first layouts |
| 3:2   | DSLR-style photos, blog inline images, classic photography, postcards | Vertical posters, mobile splashes      |
| 2:3   | Book covers, Pinterest pins, vertical posters, magazine covers, portrait portraits | Wide landing-page heroes               |
| 16:9  | Web heroes, YouTube thumbnails, video poster frames, presentation slides, OG/social cards | Tall portrait pieces, square icons      |
| 9:16  | Mobile splash screens, Instagram Stories, Reels covers, TikTok thumbnails, phone wallpapers | Desktop landing heroes, traditional photos |
| 4:3   | Side-by-side feature cards, traditional TV/monitor framing, product cards with adjacent copy | Cinematic heroes, modern phone wallpapers |
| 3:4   | Portrait product shots, vertical card layouts, mobile-first product photography | Wide landing heroes                      |
| 21:9  | Ultra-wide cinematic heroes, panoramic landing banners, full-bleed editorial photography | Anywhere that won't actually be displayed at 21:9 — cropping hurts |

## Inferring from layout

The single most useful question: **how wide is the slot the image is going
into, relative to its height?**

### Landing-page hero

A full-bleed hero behind a headline is almost always **16:9**. The image will
typically be cropped to `aspect-ratio: 16/9` or `21/9` in CSS — match the
generation ratio to the display ratio to avoid awkward crops.

- Standard hero → 16:9
- Ultra-wide cinematic hero (only practical on desktop-first sites) → 21:9 (Pro only)

### Mobile-first hero or splash

If the user is building a mobile app or a mobile-first landing page where the
hero image fills the screen, use **9:16**. Phone screens are roughly 9:19.5
these days — 9:16 is the safe match.

### Feature card with image on one side

Two-column layouts where the image is half the row and text is the other half
typically want **4:3** or **3:2** — closer to square than to widescreen. 4:3
reads as "classic, balanced." 3:2 reads as "photographic."

### Blog post inline image

Inline images in articles sit inside a content column (typically 600–800px
wide). **3:2** or **16:9** both work. Pick **3:2** for a more photographic
feel, **16:9** for a more cinematic / dramatic feel.

### Avatar, app icon, profile picture

Always **1:1**. The model will be cropped to a circle or rounded square in the
UI anyway — composing inside a square gives the model the right canvas.

### Book cover, vertical poster, Pinterest pin

**2:3**. This is the classic tall-vertical aspect ratio. Real-world book covers
are roughly 2:3 (give or take), Pinterest sees the most engagement on 2:3 pins.

### YouTube thumbnail

**16:9**. Required by YouTube. Generate at the highest practical resolution and
let YouTube downscale.

### Instagram

| Instagram surface         | Ratio   |
|---------------------------|---------|
| Square post               | 1:1     |
| Portrait post             | 3:4 or 4:5 — pick 3:4 (4:5 isn't supported) |
| Story / Reel cover        | 9:16    |
| Reel still (in-feed)      | 9:16    |

### Open Graph / social share cards

OG cards display closest to **1.91:1**. The supported ratio closest to that is
**16:9** — use it. Some platforms (LinkedIn especially) also accept square 1:1
when they don't have horizontal real estate.

### Presentation slide

Most decks are **16:9** these days. Use 16:9 unless the user has explicitly
shown they're working in 4:3 territory (older corporate templates, projector
constraints).

### Print piece

Posters and flyers vary wildly. Ask the user for the target print size and pick
the closest supported ratio:

- A4 portrait (≈1:1.41) → **3:4** (closer than 2:3)
- A4 landscape → **4:3**
- US Letter portrait (≈1:1.29) → **3:4**
- 11×17 poster portrait (≈11:17 ≈ 2:3.09) → **2:3**
- 11×17 poster landscape → **3:2**

Print pieces always want the PNG kept full-resolution — don't optimize for web.

## Decision tree

```
Is it for a webpage?
├─ Hero / banner above the fold
│   ├─ Desktop-first → 16:9 (or 21:9 if user wants ultra-wide AND Pro is OK)
│   └─ Mobile-first → 9:16
├─ Inline content image
│   └─ 3:2 or 16:9 — pick 3:2 if "photographic", 16:9 if "cinematic"
├─ Card / tile in a grid
│   ├─ Square card → 1:1
│   ├─ Landscape card → 4:3 or 3:2
│   └─ Portrait card → 3:4 or 2:3
└─ Avatar / icon
    └─ 1:1

Is it for video / social / app?
├─ YouTube thumbnail → 16:9
├─ Instagram square / podcast cover → 1:1
├─ Instagram Story, Reel, TikTok cover → 9:16
├─ Mobile app splash → 9:16
└─ Desktop app icon set → 1:1

Is it for print?
├─ Letter / A4 portrait → 3:4
├─ Letter / A4 landscape → 4:3
├─ Tabloid / 11×17 portrait → 2:3
└─ Tabloid / 11×17 landscape → 3:2

Is it for the user "just to see" with no surface in mind?
└─ Ask. Default 1:1 if they don't care.
```

## Cropping awareness

Models compose differently per ratio. A "portrait of a woman" at 1:1 gives you
a head-and-shoulders shot. The same prompt at 9:16 gives you a full-body shot.
The same prompt at 16:9 gives you the subject smaller and more environmental
context.

If the user expects the image to fill a specific slot, generate at the slot's
ratio — don't generate at 1:1 and try to crop later. Cropping loses
composition the model spent its budget on.

## When the supported ratios don't fit

If the target surface is something weird (a banner that's 5:1, a sliver
sidebar that's 1:5), generate at the closest supported ratio and crop in code
afterwards. The generation needs to give the model enough room to compose
meaningful subjects — too narrow a canvas, and you lose the subject.

For 5:1 or wider: generate **21:9** with Nano Banana Pro and crop.
For 1:5 or taller: generate **9:16** and crop the top/bottom.
