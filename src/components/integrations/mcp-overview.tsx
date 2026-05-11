/**
 * MCP overview — two-column section that opens the Integrations page. Left
 * column explains what MCP is and the feature triad we want users to retain;
 * the right column is a "tools exposed" panel that mirrors how an MCP client
 * advertises a server's surface (signature + return type + endpoint + auth).
 */

const FEATURES: Array<{ label: string; body: string }> = [
  {
    label: "REMOTE MCP (CONTEXT7-STYLE)",
    body: "We run a hosted MCP server: type remote, URL, and headers — like Context 7 — so you paste config instead of installing a binary.",
  },
  {
    label: "PER-KEY USAGE & QUOTAS",
    body: "Each key tracks its own activity, so you can revoke a noisy integration without breaking the rest.",
  },
  {
    label: "FINE-GRAINED PERMISSIONS",
    body: "Coming soon: scope keys to specific tools — let agents read but not generate, or vice versa.",
  },
];

const TOOLS: Array<{ signature: string; returns: string }> = [
  {
    signature: "generate_image(prompt, aspect?, model?, seed?)",
    returns: "image",
  },
  { signature: "list_generations(limit?)", returns: "image[]" },
  { signature: "get_image(id)", returns: "image" },
];

export function McpOverview() {
  return (
    <section
      aria-labelledby="mcp-overview-heading"
      className="grid gap-8 lg:grid-cols-5 lg:gap-10"
    >
      <div className="flex flex-col gap-6 lg:col-span-3">
        <div className="space-y-3">
          <p
            id="mcp-overview-heading"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary"
          >
            01 — WHAT IS MCP
          </p>
          <p className="max-w-prose text-base leading-relaxed text-foreground/85">
            Model Context Protocol (MCP) is an open standard for letting AI
            agents call tools and read data from external services. Get Images
            exposes a remote MCP server (Context 7–style config: type, url,
            headers) with three tools — your agent can ask for an image, list
            past generations, or fetch a specific one — using your Get Images API
            key. Optional{" "}
            <span className="font-mono text-foreground/80">
              GET_IMAGES_MODEL
            </span>{" "}
            header picks the image backend (
            <span className="text-foreground/80">openai/image-2</span>,{" "}
            <span className="text-foreground/80">google/nanobanana-pro</span>
            ).
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3" role="list">
          {FEATURES.map((feature) => (
            <li
              key={feature.label}
              className="flex flex-col gap-2 border border-border/60 bg-card/40 p-4"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {feature.label}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {feature.body}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <aside
        aria-label="Tools exposed by the Get Images MCP server"
        className="lg:col-span-2"
      >
        <div className="rounded-none border border-border/60 bg-card/40">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Tools exposed
            </p>
            <p
              aria-hidden="true"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60 tabular-nums"
            >
              03
            </p>
          </div>

          <ul className="divide-y divide-border/60" role="list">
            {TOOLS.map((tool) => (
              <li
                key={tool.signature}
                className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed whitespace-nowrap"
              >
                <span className="text-foreground/90">{tool.signature}</span>
                <span
                  aria-hidden="true"
                  className="mx-1.5 text-muted-foreground"
                >
                  →
                </span>
                <span className="text-primary">{tool.returns}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1.5 border-t border-border/60 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              ENDPOINT —{" "}
              <span className="text-foreground/80">
                https://mcp.get-images.dev/mcp
              </span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              AUTH —{" "}
              <span className="text-foreground/80">
                GET_IMAGES_API_KEY header (+ optional GET_IMAGES_MODEL:
                openai/image-2 · google/nanobanana-pro)
              </span>
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}
