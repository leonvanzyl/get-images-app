# Get Images MCP server

The Get Images remote MCP server lets agents like Claude, Cursor, Codex, and ChatGPT generate and inspect images natively — no HTTP plumbing, no client libraries, no glue code. You point your agent at one URL, drop in an API key, and the same five capabilities exposed by the REST API show up as first-class tools the agent can call on its own.

Endpoint:

```text
https://getimages.dev/api/mcp
```

This is a **remote** MCP server speaking **streamable HTTP**. The same handler responds on `GET`, `POST`, and `DELETE` on that path — your client doesn't need to care about the difference.

## Connection details

- **URL**: `https://getimages.dev/api/mcp`
- **Transport**: streamable HTTP (no stdio, no SSE)
- **Auth**: `Authorization: Bearer YOUR_API_KEY` header
- **Tool prefix**: `getimages_`

Tools available:

- `getimages_generate_image` — generate an image from a prompt. Spends credits.
- `getimages_list_images` — paginated list of your generations.
- `getimages_get_image` — fetch one image by id, with or without bytes.
- `getimages_get_account` — your user id, email, and credit balance.
- `getimages_list_usage` — paginated credit transaction history.

API keys are the same keys used by the REST API. Create and manage them in the dashboard.

## Get an API key

1. Sign in to Get Images.
2. Open **Dashboard > API keys**.
3. Click **Create key**, give it a memorable name, and copy the full secret. The secret is only shown once.

The key looks like `sk_...`. Treat it like a password. You can revoke any key individually from the same screen without affecting others.

## Client setup

The configuration shape is the same everywhere: an HTTP MCP server at `https://getimages.dev/api/mcp` with an `Authorization: Bearer YOUR_API_KEY` header. Only the surrounding file format and config key names differ. Replace `YOUR_API_KEY` with the secret you created in the dashboard.

Pick your client below — each section expands with the exact snippet and where to put it.

<details>
<summary>Claude Code</summary>

Add the server with one command. The CLI stores the config in your scoped settings file.

```bash
claude mcp add --scope user --transport http get-images https://getimages.dev/api/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

`--scope user` makes the server available across all your projects. Use `--scope project` instead if you want the entry saved to `.mcp.json` and shared with your team via version control. Use `--scope local` (the default) for a private, project-only entry.

Or edit `.mcp.json` at the project root by hand. Claude Code's parser requires the explicit `"type": "http"` field — without it, the file is rejected with a `command: expected string` error:

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

After adding, run `/mcp` inside a Claude Code session to verify the server is listed. Project-scope servers require a one-time approval prompt — accept it on first session start.

</details>

<details>
<summary>Claude Desktop</summary>

Claude Desktop supports remote MCP servers two ways.

**Option 1: Custom Connectors UI.** Open **Settings > Connectors > Add custom connector**. Paste `https://getimages.dev/api/mcp` as the URL, then add an HTTP header with name `Authorization` and value `Bearer YOUR_API_KEY`. Save and restart Claude Desktop.

**Option 2: Config file.** Edit `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

</details>

<details>
<summary>Cursor</summary>

Edit `~/.cursor/mcp.json` for a global entry, or `.cursor/mcp.json` in your project for a project-scoped entry.

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Open the command palette and run **MCP: Reload servers** to pick up the change.

</details>

<details>
<summary>VS Code (Continue, Copilot Chat)</summary>

Add a project-scoped server at `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Reload the window (or restart your MCP-aware extension) after saving.

</details>

<details>
<summary>Windsurf</summary>

Open **Settings > MCP > Add server** and use the same JSON shape:

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Save and reload Windsurf.

</details>

<details>
<summary>Cline</summary>

Open Cline's MCP servers settings (the **MCP Servers** panel in the Cline sidebar, or its config file) and add:

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Restart the Cline panel to load the new server.

</details>

<details>
<summary>Roo Code / Kilo Code</summary>

Add a project-scoped entry at `.kilocode/mcp.json` (Kilo Code) or `.roo/mcp.json` (Roo Code):

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Reload the extension after saving.

</details>

<details>
<summary>OpenAI Codex CLI</summary>

Edit `~/.codex/config.toml` and add an `[mcp_servers.<name>]` block. Codex supports remote streamable HTTP MCP servers via the `url` key and either an inline `http_headers` table or an environment-sourced bearer token.

```toml
[mcp_servers.get-images]
url = "https://getimages.dev/api/mcp"
http_headers = { Authorization = "Bearer YOUR_API_KEY" }
enabled = true
```

If you'd rather keep the secret out of the config file, set an environment variable and reference it instead:

```toml
[mcp_servers.get-images]
url = "https://getimages.dev/api/mcp"
bearer_token_env_var = "GET_IMAGES_API_KEY"
enabled = true
```

Then export `GET_IMAGES_API_KEY=...` in your shell before launching Codex. Restart the Codex CLI to pick up changes.

</details>

<details>
<summary>Gemini CLI</summary>

Edit `~/.gemini/settings.json` and add the server under `mcpServers`:

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Restart the Gemini CLI.

</details>

<details>
<summary>Zed</summary>

Zed uses `context_servers` (not `mcpServers`). Edit Zed's `settings.json`:

```json
{
  "context_servers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

You can also add it through the Agent Panel's settings view by clicking **Add Custom Server**.

</details>

<details>
<summary>JetBrains AI Assistant</summary>

Open **Settings > Tools > AI Assistant > Model Context Protocol (MCP)**, click **Add server**, then:

1. **Type**: HTTP
2. **Name**: `get-images`
3. **URL**: `https://getimages.dev/api/mcp`
4. Add a header — name `Authorization`, value `Bearer YOUR_API_KEY`.

Apply and restart the AI Assistant.

</details>

<details>
<summary>Warp</summary>

Open **Settings > AI > MCP servers > Add server**. Set:

1. **Name**: `get-images`
2. **Transport**: HTTP
3. **URL**: `https://getimages.dev/api/mcp`
4. Add a custom header — name `Authorization`, value `Bearer YOUR_API_KEY`.

Save and reload the Warp AI panel.

</details>

<details>
<summary>LM Studio</summary>

Edit LM Studio's `mcp.json` (accessible from the MCP servers settings panel) and add:

```json
{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Restart LM Studio so it reloads MCP servers.

</details>

<details>
<summary>ChatGPT (Custom Connectors)</summary>

Open **Settings > Connectors > Add custom connector** and paste `https://getimages.dev/api/mcp` as the server URL. When prompted for authentication, choose Bearer token (or "custom header") and enter `Bearer YOUR_API_KEY`.

**Known limitation.** ChatGPT's custom connectors UI is biased toward OAuth-discovered remote servers. If the Bearer-only flow doesn't accept the configuration in your account, that's a current limitation of ChatGPT's connector surface — not the Get Images server. As a workaround, use any of the other clients above; full OAuth support on the server side is on the roadmap.

</details>

<details>
<summary>Generic remote MCP client</summary>

If your client isn't listed here, use the universal shape:

- **Transport**: HTTP (streamable)
- **URL**: `https://getimages.dev/api/mcp`
- **Header**: `Authorization: Bearer YOUR_API_KEY`

Almost every MCP client maps to that shape — only the surrounding config keys change. Check your client's MCP setup docs for the exact field names.

</details>

## Verifying the connection

After the client reloads, try two quick prompts:

1. Ask the agent: **"Get my account balance from get-images."** The agent should call `getimages_get_account` and report your email and credit balance.
2. Ask the agent: **"Generate an image of a corgi at sunset."** The agent should call `getimages_generate_image` with a sensible model and aspect ratio, then display the image inline.

If both work, you're good.

## Saving images to disk

Both `getimages_generate_image` and `getimages_get_image` include an `imageUrl` field in `structuredContent`. It's an absolute, signed URL with a 15-minute TTL. Any HTTP client can fetch it — no `Authorization` header, no API key. After expiry or if the signature is tampered with, the URL returns `404`.

**Recipe A — generic HTTP client (curl, PowerShell, etc.)**

```bash
# After calling getimages_generate_image:
# 1. Read structuredContent.imageUrl from the response
# 2. Fetch and save:
curl -o my-image.jpg "<imageUrl>"
```

PowerShell equivalent:

```powershell
Invoke-WebRequest -Uri "<imageUrl>" -OutFile my-image.jpg
```

**Recipe B — AI agents with a WebFetch-style tool**

1. Call `getimages_generate_image` and note `structuredContent.imageUrl`.
2. Use your HTTP-fetch tool to download the URL (no auth header needed).
3. Write the bytes to disk.

Fetch the URL within 15 minutes of the original call. After that, request a fresh URL with `getimages_get_image` against the same image id.

## Troubleshooting

- **`401 Unauthorized`** — the API key is missing, invalid, has been revoked, or your account briefly hit the rate limit (60 requests/minute by default). Try again in a moment. If it persists, double-check the key in the dashboard and reissue it if needed.
- **Moderation rejection** — OpenAI's models decline prompts referencing real public figures, copyrighted characters, or other restricted content. Rephrase the prompt to be more generic and try again.
- **"Tool not found"** — the client hasn't reloaded after you edited its config. Fully quit and reopen the app, or run the client's "reload MCP servers" command from its command palette.
- **The image doesn't appear in the chat** — some clients only render text content blocks and don't display MCP `image` blocks inline. The image is still in the response and accessible via `structuredContent` and `getimages_get_image`. Try a client that supports image rendering (Claude Desktop, Cursor, Claude Code, Zed) if inline previews matter to you.
- **Generation seems slow** — large models (Gemini 3 Pro Image, GPT Image 2) and deep-thinking mode take longer. The fast tier (Gemini 2.5 Flash Image, GPT Image 1.5) is significantly quicker.
- **"Operation timed out" but the image shows up in the dashboard** — your MCP client is giving up before the server responds. The server waits up to ~13 minutes per call and emits `notifications/progress` every 10s; up-to-date MCP clients reset their timeout on each progress message. If you still hit timeouts, raise your client's MCP timeout (Claude Code: `export MCP_TIMEOUT=900000` for 15 minutes). The image is always retrievable via `getimages_get_image` even if the original `generate_image` call appeared to fail client-side.

## Tools reference

### getimages_generate_image

Generates an image from a text prompt and returns it as an MCP `image` content block plus structured metadata.

**Credits cost.** Each successful call is irreversibly billed against the caller's account. Base credit cost depends on the model:

- `openai:gpt-image-1.5` — 3 credits
- `openai:gpt-image-2` — 5 credits
- `google:gemini-2.5-flash-image` — 3 credits
- `google:gemini-3.1-flash-image-preview` — 5 credits (7 with deep thinking)
- `google:gemini-3-pro-image-preview` — 12 credits (18 with deep thinking)

Inputs:

- `prompt` (string, required) — 1 to 8,000 characters.
- `modelId` (string, required) — one of the model ids above.
- `aspectRatio` (string, optional) — `1:1`, `3:2`, `2:3`, `16:9`, `9:16`, `4:3`, `3:4`. The Gemini 3 Pro Image model additionally supports `21:9`.
- `style` (string, optional) — a short style instruction appended to the prompt.
- `thinkingLevel` (`default` | `deep`, optional) — only supported on `google:gemini-3.1-flash-image-preview` and `google:gemini-3-pro-image-preview`. `deep` uses the higher credit cost above.

Returns:

- An MCP `image` content block with the generated bytes (base64) and the correct `mimeType`.
- A short text content block summarising charge and remaining balance.
- A `structuredContent` object with `id`, `modelId`, `providerId`, `aspectRatio`, `style`, `thinkingLevel`, `mediaType`, `credits.charged`, `credits.remaining`, `createdAt`, and `imageUrl`. The base64 bytes are **not** duplicated into `structuredContent` to keep context cost low.
- `imageUrl` — absolute URL pointing to the generated image. Short-lived (15-minute TTL) signed URL. Any HTTP client can fetch it — no authentication header required. Treat it as a one-shot download link; do not store or share it.

Caveats:

- Moderation rejections come back as a tool error with a descriptive message — the agent should read the message and rephrase.
- If the account doesn't have enough credits, the tool returns an `insufficient_credits` error and no image is generated.

### getimages_list_images

Returns the caller's previous generations, newest first. Read-only.

Inputs:

- `limit` (integer, optional) — 1 to 100, default 20.
- `offset` (integer, optional) — non-negative, default 0.

Returns `structuredContent` with `images`, `total`, `limit`, and `offset`. Each image entry includes its id, prompt, model, aspect ratio, style, thinking level, media type, credit cost, and created timestamp. **Bytes are not included** — use `getimages_get_image` with `includeBytes:true` for that.

### getimages_get_image

Fetch one image by id. Read-only.

Inputs:

- `id` (UUID, required) — the image id from `getimages_list_images` or `getimages_generate_image`.
- `includeBytes` (boolean, optional, default `false`) — when `true`, the response also contains the image as an MCP `image` content block.

Returns metadata in `structuredContent.image`, plus `structuredContent.imageUrl` — an absolute URL pointing to the image. Short-lived (15-minute TTL) signed URL. Any HTTP client can fetch it — no authentication header required. Treat it as a one-shot download link; do not store or share it. When `includeBytes` is `true`, the response also contains an `image` content block. Bytes are not duplicated into `structuredContent`.

### getimages_get_account

Returns the authenticated caller's account info. Read-only. No inputs.

Returns `structuredContent` with `userId`, `email`, and `creditBalance`. A short text summary is also included for the agent to surface to the user.

Useful as a "check before generate" call — agents can read the balance, decide whether there's enough headroom for the next generation, and warn the user if not.

### getimages_list_usage

Returns the caller's credit transaction history (deductions for generations, refunds, additions from purchases), newest first. Read-only.

Inputs:

- `limit` (integer, optional) — 1 to 100, default 20.
- `offset` (integer, optional) — non-negative, default 0.

Returns `structuredContent` with `transactions`, `total`, `limit`, and `offset`. Each transaction includes `id`, `amount`, `type`, `description`, `referenceId`, and `createdAt`.

## Safe use

A remote MCP server hands a powerful set of tools to whatever agent is driving the session. A few things to keep in mind:

- **Agents that auto-execute tools can spend credits without asking.** If your client or agent has a "run tools without confirmation" mode, `getimages_generate_image` can be called repeatedly and each call is irreversibly billed. Configure your agent to confirm before generating, or only enable auto-tool-use for the read-only tools.
- **Content moderation may reject some prompts.** OpenAI's models reject prompts that reference real public figures, copyrighted characters, sexual content, or other restricted categories. When that happens, the tool returns a clear moderation message — rephrase the prompt to avoid the flagged content and try again.
- **Never paste your API key into shared chats, public repos, or pastebins.** The key grants full access to your account, including spending credits.
- **Rotate keys if you suspect a leak.** Create a new key, update your clients, then revoke the old one from the dashboard.
- **Per-key revocation is supported.** Each client can have its own key, which makes it easy to pull access for one machine without disrupting the others.
- **Every call records a credit transaction.** You can audit usage at any time via `getimages_list_usage` or the dashboard.

## Credits and pricing

Credit packs and per-model pricing are listed on the [pricing page](/pricing). The same balance is shared across the REST API, the MCP server, and the dashboard UI — every successful generation deducts credits regardless of which transport made the call.
