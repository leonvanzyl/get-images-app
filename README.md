# Get Images

[![skills.sh](https://skills.sh/b/leonvanzyl/get-images-app)](https://skills.sh/leonvanzyl/get-images-app/get-images)

> Generate images from any agent, script, or browser. One API key, five models, four ways to call it.

Get Images is a self-hostable image-generation platform built on Next.js. It exposes the same image-generation service through **a web UI**, **a REST API**, **a remote MCP server**, and **an installable agent skill** — so people, scripts, and AI agents can all hit it without learning a new SDK.

## Features

- **Five image models out of the box** — OpenAI `gpt-image-1.5`, OpenAI `gpt-image-2`, Google Gemini 2.5 Flash Image, Gemini 3.1 Flash Image (Banana 2), Gemini 3 Pro Image (Banana Pro). Aspect ratios and reasoning depth adapt per model.
- **Web UI** — landing page, prompt composer, library, API keys, integrations, profile, and Polar-powered pricing.
- **REST API** (`/api/v1/*`) — Bearer-auth endpoints to generate images, list and fetch them, read your account, and inspect credit usage. OpenAPI JSON is shipped.
- **Remote MCP server** (`/api/mcp`) — streamable HTTP MCP with the same five capabilities surfaced as tools (`getimages_generate_image`, `getimages_list_images`, `getimages_get_image`, `getimages_get_account`, `getimages_list_usage`).
- **Agent skill** — `.claude/skills/get-images/` teaches agents *how* to use the MCP well (model selection, aspect-ratio inference, prompt drafting, WebP optimization for the web).
- **Credit system + payments** — model-aware credit pricing with a deep-thinking surcharge, Polar checkout for credit packs.
- **Auth** — Better Auth sessions for the browser; API keys (Better Auth API Key plugin) for everything else.
- **Storage abstraction** — local filesystem in dev, Vercel Blob in production, auto-detected from env.
- **Design system** — Open Studio: warm cream canvas, coral accent, Fraunces + Geist + JetBrains Mono. See `DESIGN.md`.

## Four ways to call it

### 1. Web UI

Sign in, create images in the composer, browse them in the library, manage keys in the dashboard.

- Landing: `/`
- Dashboard: `/dashboard`
- Library: `/dashboard/library`
- API keys: `/dashboard/keys`
- Integrations & docs: `/dashboard/integrations`, `/docs/api`, `/docs/mcp`, `/docs/skill`

### 2. REST API

```bash
curl https://your-domain.com/api/v1/images/generate \
  -X POST \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A warm editorial product photo of a ceramic coffee cup on a studio desk",
    "modelId": "google:gemini-2.5-flash-image",
    "aspectRatio": "1:1"
  }'
```

Endpoints:

| Method | Path                          | Purpose                                     |
|--------|-------------------------------|---------------------------------------------|
| POST   | `/api/v1/images/generate`     | Generate a new image. Charges credits.      |
| GET    | `/api/v1/images`              | Paginated list of your generations.         |
| GET    | `/api/v1/images/:id`          | Fetch one image, with or without bytes.     |
| GET    | `/api/v1/account`             | User id, email, credit balance.             |
| GET    | `/api/v1/usage`               | Paginated credit transaction history.       |

Full docs: `docs/api.md` (also served at `/docs/api`). Default rate limit: 60 req/min per key.

### 3. Remote MCP server

Point any MCP-aware agent (Claude Code, Claude Desktop, Cursor, Codex, ChatGPT, …) at:

```text
https://your-domain.com/api/mcp
```

with header `Authorization: Bearer YOUR_API_KEY`. The tool prefix is `getimages_`. Per-client setup snippets are in `docs/mcp.md` (also served at `/docs/mcp`).

### 4. Agent skill

The companion skill at `.claude/skills/get-images/` is distributed via [skills.sh](https://skills.sh):

```bash
npx skills add leonvanzyl/get-images-app --skill get-images
```

It teaches your agent the model catalog, aspect-ratio rules, prompt-drafting workflow, and WebP optimization for web assets. See `docs/skill.md` or `/docs/skill`.

## Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL (local Docker or hosted)
- API keys for whichever providers you want enabled (OpenAI, Google AI, OpenRouter)
- (optional) Polar account for payments, Vercel Blob token for production storage

### Setup

```bash
git clone https://github.com/leonvanzyl/get-images-app.git
cd get-images-app
pnpm install
cp env.example .env
# fill in .env (see below)
pnpm db:migrate
pnpm db:seed-pricing
pnpm dev
```

App runs at <http://localhost:3000>.

### Environment variables

```env
# Database
POSTGRES_URL=postgresql://dev_user:dev_password@localhost:5432/postgres_dev

# Better Auth — generate via https://www.better-auth.com/docs/installation
BETTER_AUTH_SECRET=

# Image-generation providers (enable whichever you use)
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL="openai/gpt-5-mini"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# MCP signed URL secret — generate with: openssl rand -base64 48
MCP_FILE_SIGNING_SECRET=

# Storage — leave blank for local public/uploads, set for Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Polar payments (sandbox or production keys)
POLAR_WEBHOOK_SECRET=polar_
POLAR_ACCESS_TOKEN=polar_
```

See `env.example` for the canonical list.

## Models, pricing, and capabilities

Model capabilities (aspect ratios, deep thinking) are declared in `src/services/image-generation/models.ts`. Credit cost (base and deep-thinking surcharge) lives in the `model_pricing` table — seeded by `pnpm db:seed-pricing` from `scripts/seed-model-pricing.ts`.

Credit packs (`src/lib/polar.ts`, `src/app/(site)/pricing/page.tsx`):

| Pack    | Credits | USD    |
|---------|---------|--------|
| Starter | 100     | $5.00  |
| Plus    | 500     | $22.50 |
| Pro     | 1200    | $48.00 |

Full capability + pricing matrix lives in `DESIGN.md` §14–§15.

## Project structure

```
src/
├── app/
│   ├── (site)/                  # Public + dashboard pages
│   │   ├── docs/{api,mcp,skill} # Markdown-rendered docs
│   │   ├── pricing/             # Polar checkout
│   │   └── ...
│   ├── api/
│   │   ├── v1/                  # REST API (generate, images, account, usage)
│   │   ├── mcp/                 # Remote MCP handler + signed file URLs
│   │   └── auth/                # Better Auth catch-all
│   └── dashboard/               # Library, keys, integrations
├── components/                  # UI (shadcn-based)
├── lib/                         # auth, db, polar, storage, utils
├── services/
│   └── image-generation/        # Provider-agnostic generation pipeline
└── db/                          # Drizzle schema + migrations
docs/                            # Source markdown for the /docs/* pages
.claude/skills/get-images/       # Installable agent skill
scripts/                         # setup, seed-model-pricing
```

## Scripts

```bash
pnpm dev               # Next.js dev server (Turbopack)
pnpm build             # Production build (runs migrations first)
pnpm start             # Start production server
pnpm lint              # ESLint
pnpm typecheck         # TypeScript --noEmit
pnpm check             # lint + typecheck
pnpm format            # Prettier write
pnpm db:generate       # Drizzle: generate migration from schema
pnpm db:migrate        # Drizzle: apply pending migrations
pnpm db:studio         # Drizzle Studio (DB GUI)
pnpm db:seed-pricing   # Seed model_pricing rows
```

> ⚠️ **Never run `pnpm db:push`** — always migrate via `db:generate` + `db:migrate`. See `AGENTS.md`.

## Architecture notes

- **Auth split.** Browser uses Better Auth sessions (cookies). API/MCP use Bearer API keys via the Better Auth API Key plugin. No OAuth.
- **One service layer.** Web UI, REST API, and MCP all call the same `src/services/image-generation/*` pipeline — provider selection, capability validation, credit charge, persistence, and storage upload happen in one place.
- **Signed MCP file URLs.** When the MCP tools return image bytes, the URLs are HMAC-signed with `MCP_FILE_SIGNING_SECRET` and served from `/api/mcp/files/[id]`.
- **MCP route duration.** `maxDuration = 300` on the MCP route to fit Vercel Hobby/Pro plan limits.

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Required production env vars: everything in `env.example` plus `BLOB_READ_WRITE_TOKEN` (if you want hosted storage instead of the filesystem). `pnpm build` runs `db:migrate` automatically.

## Design

The visual system — Open Studio: warm cream canvas, coral accent, Fraunces display + Geist body + JetBrains Mono for code — is documented in [`DESIGN.md`](./DESIGN.md). Project conventions for AI agents working on the codebase are in [`AGENTS.md`](./AGENTS.md).

## License

MIT — see [`LICENSE`](./LICENSE).
