# Service Layer: Image Generation

## Context

The app currently mocks all image generation with picsum.photos placeholders and a 1600ms setTimeout. We need to replace this with a real service layer that calls OpenAI and Google Gemini APIs, stores generated images, and persists metadata to the database. The service layer must be channel-agnostic (callable from Web UI, REST API, MCP, CLI) per the architecture diagram.

---

## Models to Support

**OpenAI (2 models):**
- `gpt-image-1.5` — "GPT Image 1.5"
- `gpt-image-2` — "GPT Image 2"

**Google Gemini — Nano Banana (3 models):**
- `gemini-2.5-flash-image` — "Nano Banana"
- `gemini-3.1-flash-image-preview` — "Nano Banana 2"
- `gemini-3-pro-image-preview` — "Nano Banana Pro"

---

## Approach

Use the Vercel AI SDK's `generateImage()` (already installed as `ai@^5.0.172`) with `@ai-sdk/openai` and `@ai-sdk/google` provider packages. This gives a unified `GeneratedFile` response format (`.uint8Array`, `.mediaType`) across both providers, avoiding separate SDK integrations.

---

## File Structure

```
src/services/image-generation/
  types.ts          — Shared types (Provider, Model, Input, Result)
  errors.ts         — ConfigError, ProviderError, ValidationError
  models.ts         — Static model registry (5 models across 2 providers)
  providers/
    openai.ts       — OpenAI adapter (aspect→size mapping + generateImage call)
    google.ts       — Google adapter (aspect ratio passthrough + generateImage call)
    index.ts        — Provider router: resolves providerId → adapter function
  index.ts          — Public API: generate(), listModels(), getModel()

src/app/dashboard/
  actions.ts        — Server Actions: generateImageAction(), getAvailableModelsAction()
```

---

## Implementation Steps

### Step 1: Install dependencies
```
pnpm add @ai-sdk/openai @ai-sdk/google
```

### Step 2: Add env vars — `src/lib/env.ts`
Add to `serverEnvSchema`:
- `OPENAI_API_KEY: z.string().optional()`
- `GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional()`

Add warning in `checkEnv()` if neither key is set.

### Step 3: Add `generation` table — `src/lib/schema.ts`
New table following existing patterns (text PKs, timestamps, indexes):
- `id` (text PK — use `crypto.randomUUID()`)
- `userId` (text FK → user.id, cascade delete)
- `prompt` (text)
- `modelId` (text — e.g. "openai:gpt-image-2")
- `providerId` (text — "openai" | "google")
- `aspectRatio` (text)
- `style` (text, nullable)
- `seed` (integer, nullable)
- `imageUrl` (text)
- `mediaType` (text)
- `createdAt` (timestamp, defaultNow)

Indexes: `generation_user_id_idx`, `generation_created_at_idx`

Then run `pnpm db:generate` and `pnpm db:migrate`.

### Step 4: Create service layer types — `src/services/image-generation/types.ts`
```typescript
ProviderId = "openai" | "google"

ImageModelDefinition {
  id: string              // "openai:gpt-image-2"
  providerId: ProviderId
  modelId: string         // "gpt-image-2"
  name: string            // "GPT Image 2"
  description: string
}

GenerateImageInput {
  prompt: string
  modelId: string         // compound ID "openai:gpt-image-2"
  aspectRatio?: string
  style?: string          // appended as style guidance to prompt
  seed?: number
  userId: string
}

GeneratedImage {
  id: string
  url: string
  prompt: string
  modelId: string
  providerId: ProviderId
  aspectRatio: string
  style?: string
  seed?: number
  createdAt: string       // ISO string
}

GenerateImageResult {
  image: GeneratedImage
}
```

### Step 5: Create error types — `src/services/image-generation/errors.ts`
- `ImageGenerationError` (base)
- `ConfigError` — missing API key
- `ProviderError` — API call failure
- `ValidationError` — bad input

### Step 6: Create model registry — `src/services/image-generation/models.ts`
Static array of 5 `ImageModelDefinition` entries. Export `IMAGE_MODELS`, `getModel(id)`, `listModels(options?)`.

`listModels({ onlyConfigured: true })` filters to models whose provider has an API key in env, so the UI only shows usable models.

### Step 7: Create provider adapters — `src/services/image-generation/providers/`

**`openai.ts`:**
- Creates `@ai-sdk/openai` provider instance with the API key
- Maps aspect ratio → size string (e.g. "1:1" → "1024x1024", "16:9" → "1536x1024")
- Calls `generateImage()` with `openai.image(modelId)`

**`google.ts`:**
- Creates `@ai-sdk/google` provider instance with the API key
- Passes `aspectRatio` directly (Google supports "1:1", "16:9", etc.)
- Calls `generateImage()` with `google.image(modelId)`

**`index.ts`:**
- `getProviderAdapter(providerId)` — returns the right adapter function
- Checks API key exists, throws `ConfigError` if not

### Step 8: Create main service — `src/services/image-generation/index.ts`

`generate(input)` flow:
1. Validate input (prompt not empty, model exists)
2. Parse `modelId` → extract `providerId` and provider-specific model name
3. If `style` is set, append to prompt (e.g. "... Style: Cinematic")
4. Call provider adapter → get `GeneratedFile` (base64/uint8Array)
5. Convert to Buffer, upload via `storage.upload()` with folder `"generations"` and UUID filename
6. Insert row into `generation` table via Drizzle
7. Return `GenerateImageResult`

Re-export `listModels()` and `getModel()` from models.ts.

### Step 9: Create server actions — `src/app/dashboard/actions.ts`

**`generateImageAction(input)`:**
- `"use server"` directive
- Authenticate via `auth.api.getSession()`
- Validate input with Zod schema
- Call `generate()` from service layer
- Return discriminated union: `{ success: true, data }` | `{ success: false, error }`

**`getAvailableModelsAction()`:**
- `"use server"` directive
- Call `listModels({ onlyConfigured: true })`
- Return model definitions array

### Step 10: Update settings panel — `src/components/generate/settings-panel.tsx`

Key changes:
- Replace `MOCK_MODELS` import with `ImageModelDefinition` type from service layer types
- Change `GenerateModel` type to `ImageModelDefinition`
- Group models by provider in the Select dropdown using `SelectGroup` + `SelectLabel`
- Show provider name (OPENAI / GOOGLE) as group headers
- Accept models as a prop instead of importing static list

### Step 11: Update result stage — `src/components/generate/result-stage.tsx`

Key changes:
- Replace `MockImage` type with a local `GeneratedImageDisplay` type that matches what the page provides
- Make download button functional: `<a href={url} download>` or fetch + blob download
- "Save to library" becomes a no-op toast since images are persisted on generation

### Step 12: Update recent strip — `src/components/generate/recent-strip.tsx`

- Replace `MockImage` type with the same `GeneratedImageDisplay` type
- No other functional changes needed

### Step 13: Update dashboard page — `src/app/dashboard/page.tsx`

Key changes:
- Import and call `generateImageAction` and `getAvailableModelsAction` from `./actions`
- Load available models on mount via `useEffect` → `getAvailableModelsAction()`
- Replace `setTimeout` mock with real `generateImageAction()` call in `runGeneration`
- Handle loading/error states from the server action response
- Show toast on errors (missing API key, provider failure, etc.)
- Update state types from `MockImage` to `GeneratedImageDisplay`
- Keep the `picsumUrl` import for the recent strip history (existing items only)

### Step 14: Update next.config.ts (if needed)

Generated images are stored via `storage.ts` which uses either:
- Vercel Blob (`*.public.blob.vercel-storage.com`) — already in remotePatterns
- Local filesystem (`/uploads/...`) — served from public dir, no config needed

No changes needed unless a new storage domain is introduced.

### Step 15: Update storage.ts max file size

Generated images can be larger than 5MB. Pass a custom config to `upload()` with `maxSize: 20 * 1024 * 1024` (20MB). Also add `image/webp` to allowed types if not present.

### Step 16: Clean up mock-data.ts

Keep: `AspectRatio`, `StylePreset`, `ASPECT_RATIOS`, `STYLE_PRESETS`, `EXAMPLE_PROMPTS`, `aspectDimensions()`, `picsumUrl()`
Remove or deprecate: `MOCK_MODELS`, `ModelId`, `MockImage`, `MOCK_IMAGES` (still needed by Library page until it reads from DB — leave for now but the Generate page stops using them)

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `src/lib/env.ts` | Add OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY |
| `src/lib/schema.ts` | Add `generation` table |
| `src/lib/storage.ts` | No code changes; pass higher maxSize from caller |
| `src/app/dashboard/page.tsx` | Wire server actions, remove mock generation |
| `src/components/generate/settings-panel.tsx` | Dynamic model list, grouped by provider |
| `src/components/generate/result-stage.tsx` | New image type, working download |
| `src/components/generate/recent-strip.tsx` | New image type |
| `next.config.ts` | Possibly no changes needed |
| `package.json` | Add @ai-sdk/openai, @ai-sdk/google |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/services/image-generation/types.ts` | Shared types |
| `src/services/image-generation/errors.ts` | Error classes |
| `src/services/image-generation/models.ts` | Model registry |
| `src/services/image-generation/providers/openai.ts` | OpenAI adapter |
| `src/services/image-generation/providers/google.ts` | Google adapter |
| `src/services/image-generation/providers/index.ts` | Provider router |
| `src/services/image-generation/index.ts` | Public service API |
| `src/app/dashboard/actions.ts` | Server actions |

---

## Verification

1. **Lint + typecheck**: `pnpm check` passes
2. **DB migration**: `pnpm db:generate && pnpm db:migrate` succeeds
3. **Dev server**: `pnpm dev` starts without errors
4. **Generate with OpenAI**: Select an OpenAI model, enter prompt, generate → image appears in result stage, record saved to DB
5. **Generate with Google**: Select a Nano Banana model, enter prompt, generate → image appears, record saved to DB
6. **Model list**: Only models with configured API keys appear in the dropdown
7. **Error handling**: Remove one API key → those models disappear from selector; try generating with bad key → user-friendly error toast
8. **Download**: Click download on a generated image → file downloads to browser
9. **Recent strip**: Generated images appear in the session strip and can be re-selected
