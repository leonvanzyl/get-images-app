# Model reference

Five image models live behind the Get Images MCP. They differ in cost, speed,
text-rendering quality, and supported features. Pick deliberately — sending the
wrong call wastes credits.

## Capability matrix

| Model ID                                   | Friendly name      | Provider | Aspect ratios                                  | Deep thinking | Typical credit cost (base / deep) |
|--------------------------------------------|--------------------|----------|------------------------------------------------|---------------|------------------------------------|
| `openai:gpt-image-1.5`                     | GPT Image 1.5      | OpenAI   | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4            | —             | 3 / —                              |
| `openai:gpt-image-2`                       | GPT Image 2        | OpenAI   | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4            | —             | 5 / —                              |
| `google:gemini-2.5-flash-image`            | Nano Banana        | Google   | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4            | —             | 3 / —                              |
| `google:gemini-3.1-flash-image-preview`    | Nano Banana 2      | Google   | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4            | yes           | 5 / 7                              |
| `google:gemini-3-pro-image-preview`        | Nano Banana Pro    | Google   | 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4, **21:9**  | yes           | 12 / 18                            |

Credit numbers are the published defaults — `getimages_list_usage` shows the
exact amount the account was charged for any specific generation.

## When to pick which

### GPT Image 1.5 — `openai:gpt-image-1.5`

**Use when:** the user wants fast, cheap, "good enough" generations. Iterating
on layout placeholders, brainstorming, or building a first draft of a page where
you'll regenerate the image later anyway.

**Strengths:** Fast turnaround. Cheapest OpenAI option. Solid general-purpose
quality.

**Weaknesses:** Less faithful to detailed prompts than GPT Image 2. Doesn't
support deep thinking. Text in images is hit-or-miss.

### GPT Image 2 — `openai:gpt-image-2`

**Use when:** the user explicitly wants OpenAI quality, the prompt is long and
detailed, or the image needs to be photoreal.

**Strengths:** High prompt adherence — follows complex prompts closely.
Excellent photorealism.

**Weaknesses:** Slower (often 30–60s, longer for complex prompts). More
expensive than Nano Banana. No 21:9. No deep-thinking mode.

### Nano Banana — `google:gemini-2.5-flash-image`

**Use when:** the user wants a friendly speed-to-quality balance and they're not
fussed about which provider. The default "do a good job, fast, cheap" pick.

**Strengths:** Fast. Cheap (same base cost as GPT Image 1.5). Good general
quality. Solid for illustrative and stylized work.

**Weaknesses:** No deep thinking. Less consistent on highly detailed prompts
than the Pro tier.

### Nano Banana 2 — `google:gemini-3.1-flash-image-preview`

**Use when:** you want better coherence than Nano Banana without paying for Pro.
Especially good when the user is iterating and might want to enable deep
thinking on a retry.

**Strengths:** Better than 2.5 at multi-subject scenes. Deep thinking available
when needed.

**Weaknesses:** Slightly slower than 2.5 Flash. Still no 21:9 support.

### Nano Banana Pro — `google:gemini-3-pro-image-preview`

**Use when:**
- The image needs readable, well-rendered text — posters, infographics,
  slides, signage, book covers.
- The composition is complex — multiple subjects, specific spatial
  relationships, tight framing.
- The user wants an **ultra-wide 21:9 hero** (no other model supports it).
- The user said "best quality, money is fine."

**Strengths:** Best text rendering of the lineup. Best composition consistency.
Only model that supports 21:9.

**Weaknesses:** Slowest (60s+ on deep thinking is normal). Most expensive (12
credits base, 18 on deep thinking — 4–6x the cheapest models).

## Deep thinking — when to flip it on

Only Nano Banana 2 and Nano Banana Pro accept `thinkingLevel`. Two values:

- `default` (fast, cheap) — the standard `minimal` on 3.1 Flash, `low` on 3 Pro.
- `deep` — maps to `high` on both. Costs more credits, takes more time.

**Turn on deep when any of these is true:**
- The prompt mentions specific text that must appear in the image and read
  correctly.
- The scene has 3+ distinct subjects that need to coexist coherently.
- The user said the first attempt got the composition wrong (subjects in the
  wrong place, missing elements, weird perspective).
- The image is destined for a real, customer-facing surface — landing-page
  hero, infographic, poster — where artifacts are unacceptable.

**Leave it off when:** the prompt is simple, the user is iterating, or cost
matters.

## Cost-vs-quality decision tree

When the user hasn't named a model:

1. **Did they mention cost / "cheap" / "quick"?** → GPT Image 1.5 **or** Nano
   Banana. Pick Nano Banana unless they've shown an OpenAI preference earlier.
2. **Did they mention "best" / "highest quality" / "important" / "client-facing"?**
   → Nano Banana Pro.
3. **Does the image need readable text or 21:9?** → Nano Banana Pro.
4. **Is the user iterating and might retry?** → Nano Banana 2 (cheap baseline,
   easy upgrade path to deep thinking).
5. **Defaulting in a neutral context?** → Nano Banana. Friendly, fast,
   cheap, good enough for most things.

## Provider quirks worth knowing

- **OpenAI models** sometimes refuse prompts for content-policy reasons. The
  error message is verbatim from the provider — surface it, don't paraphrase.
- **Gemini models** can occasionally return a slightly different aspect ratio
  than requested (cropping during post-processing). Cross-check
  `structuredContent.aspectRatio` in the response if it matters.
- All five models return PNG-encoded bytes via the MCP regardless of provider.
