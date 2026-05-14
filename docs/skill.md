# Get Images agent skill

The Get Images **agent skill** is a small bundle of instructions and helper scripts you install into your coding agent (Claude Code, Claude Desktop, Cursor, Codex, and others). It sits next to our MCP server: the MCP gives your agent the tools to generate images, and the skill teaches the agent how to use those tools well inside a real coding workflow.

Without the skill, an agent that has the Get Images MCP installed *can* generate images — but it has to guess at the things it doesn't know: which model, what aspect ratio, where to save the file, whether to optimize for the web. With the skill installed, those guesses become principled decisions based on what the agent is actually building.

## What the skill teaches your agent

The skill ships as a single `SKILL.md` plus a few reference files and a helper script. Once installed, it activates whenever you ask the agent to create, generate, or add an image to a project. It changes the agent's behavior in four concrete ways:

1. **Pick the right model.** Instead of defaulting to whichever model the agent last saw, it surfaces a 2-3 way choice with a one-line trade-off — Nano Banana for fast/cheap, Nano Banana Pro for high-stakes work, GPT Image 2 for photorealism, and so on. When the task obviously points at one model (a poster with readable text → Nano Banana Pro), the agent skips the question and explains why.

2. **Pick the right aspect ratio.** Hero on a landing page → 16:9. Mobile splash → 9:16. Avatar → 1:1. Side-by-side product card → 4:3. The skill includes a layout-to-ratio table the agent consults instead of asking you for every generation.

3. **Draft the prompt for you.** If you ask "add a hero image" without saying *what*, the agent reads the surrounding code — headings, brand copy, existing colors — and proposes a prompt for you to approve. No more "what should the prompt be?" round-trips.

4. **Save and optimize correctly.** The agent infers the right folder based on the framework (Next.js → `public/`, Astro → `src/assets/`, etc.) and converts web-bound images to **WebP** automatically using a bundled Pillow script. Posters, video thumbnails, and OG cards stay as full-resolution PNGs because that's what those surfaces actually want.

The full set of decisions, model catalog, aspect-ratio guide, and worked recipes (Next.js hero, MDX blog inline image, YouTube thumbnail, OG card, app icon, infographic, etc.) live inside the skill itself — your agent will load whichever reference file it needs at the time.

## Prerequisites

Before installing the skill, make sure you've already done two things:

1. **Created a Get Images API key.** The skill calls the MCP server; the MCP server needs a key. Open [Dashboard > API keys](/dashboard/keys) and create one if you haven't yet.

2. **Connected the Get Images MCP server to your agent.** The skill is useless without the MCP tools it teaches the agent to call. Follow the [MCP setup guide](/docs/mcp) for your client (Claude Code, Claude Desktop, Cursor, Codex, etc.) first.

The skill itself doesn't need any extra credentials — it's pure instructions for the agent, installed locally.

## Install the skill

The skill is distributed via [skills.sh](https://skills.sh), the open agent-skill ecosystem. Installation is one command via the `skills` CLI — works on macOS, Linux, and Windows. You don't need to install the CLI globally; `npx` runs it on demand.

**Install into the current project:**

```bash
npx skills add leonvanzyl/get-images-app --skill get-images
```

This drops the skill into your project's agent directory (`.claude/skills/`, `.cursor/skills/`, or whatever your agent uses) so it ships alongside your code and your teammates pick it up on the next clone.

**Install globally (available across every project on this machine):**

```bash
npx skills add leonvanzyl/get-images-app --skill get-images -g
```

Lands at `~/.claude/skills/get-images/` instead.

**Target a specific agent only:**

```bash
npx skills add leonvanzyl/get-images-app --skill get-images -a claude-code
```

The CLI auto-detects every agent you have installed by default. Use `-a` to limit installation to one (`claude-code`, `cursor`, `codex`, `windsurf`, `cline`, and 50+ more are supported).

**Just see what's in the bundle first:**

```bash
npx skills add leonvanzyl/get-images-app --list
```

Prints the available skills without installing anything.

## Verify it's installed

Run the CLI's list command:

```bash
npx skills list
```

You should see `get-images` in the output along with the agent it was installed for.

Then test it inside your agent. Ask something like:

> Add a hero image to the top of the landing page.

A correctly-installed skill will produce one of these behaviors instead of an immediate `getimages_generate_image` call:

- The agent presents 2-3 model options with a brief trade-off (e.g. "Banana Pro for quality, Banana for cheap+fast"), or it picks one and explains why.
- It infers the 16:9 aspect ratio without asking, based on the hero layout.
- It drafts a prompt from your page copy and asks you to confirm before spending credits.
- After generation, it converts the result to WebP and saves it into `public/`.

If the agent just calls the MCP tool blindly without surfacing those decisions, the skill probably isn't being loaded — check the install location matches what your agent reads from.

## Keeping the skill up to date

```bash
npx skills update get-images
```

Updates a single skill. Without an argument the CLI updates everything it manages.

```bash
npx skills remove get-images
```

Removes the skill. Use `-g` for the global install, or `-a <agent>` to remove from a specific agent.

## Source and contributions

The skill is **open source** and lives alongside the MCP server itself, in [`leonvanzyl/get-images-app`](https://github.com/leonvanzyl/get-images-app/tree/main/.claude/skills/get-images) on GitHub. Three files make up the bulk of it:

- `SKILL.md` — the core triggering description plus the four-decision workflow.
- `references/models.md`, `references/aspect-ratios.md`, `references/workflows.md` — deep references the agent reads on demand.
- `scripts/optimize_for_web.py` — the Pillow-based WebP converter the agent runs after generation when the image is web-bound.

PRs and issues are welcome — especially recipes for workflows we haven't covered yet (mobile app onboarding screens, podcast cover art, Twitter / X header images, etc.).

## Frequently asked

**Do I need the skill if I'm already using the MCP?** No, it's optional. The MCP works fine without it. The skill just makes the agent's behavior smarter and less repetitive, so you spend fewer prompts negotiating decisions you'd rather have inferred from context.

**Does the skill spend credits?** The skill itself is just instructions and one Python script — no credit cost. The MCP tools it teaches the agent to call still spend credits the normal way; the skill helps the agent spend them more deliberately.

**Will the skill work with my MCP-aware agent that isn't Claude Code?** Yes. The `skills` CLI supports 50+ agents (Cursor, Codex, Windsurf, Cline, Zed, JetBrains AI Assistant, etc.). Use `-a <agent-name>` to target a specific one or let the CLI auto-detect everything.

**Where does the WebP optimizer get Pillow from?** The script checks for Pillow on first run and prints a `pip install Pillow` message if it's missing. Most coding environments already have it installed; if not, it's a single `pip` command.

**Is there a way to install without `npx`?** Yes — clone the [repo](https://github.com/leonvanzyl/get-images-app) and copy `.claude/skills/get-images/` into your agent's skills folder by hand. The CLI is just convenience.
