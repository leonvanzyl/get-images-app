import { Globe, KeyRound, Sparkles } from "lucide-react";

/**
 * Intro card for the Integrations page.
 *
 * One short paragraph that explains MCP in plain language, followed by three
 * concrete feature bullets (icon + text). No "coming soon" placeholders, no
 * tools-exposed sidebar — that level of API detail belongs in the docs.
 */

const FEATURES: Array<{
  icon: typeof Globe;
  title: string;
  body: string;
}> = [
  {
    icon: Globe,
    title: "Remote MCP server",
    body: "Hosted by us. Paste a tiny JSON snippet — no binary to install, no local process to babysit.",
  },
  {
    icon: KeyRound,
    title: "Per-key usage",
    body: "Each API key tracks its own activity, so you can revoke a noisy integration without breaking the rest.",
  },
  {
    icon: Sparkles,
    title: "Pick a model per request",
    body: "Set the GET_IMAGES_MODEL header to choose the image backend (e.g. openai/gpt-image-2, google/nano-banana-pro).",
  },
];

export function McpOverview() {
  return (
    <section aria-labelledby="mcp-overview-heading" className="rounded-2xl border bg-card p-6">
      <h2 id="mcp-overview-heading" className="font-display text-lg font-medium">
        What is MCP?
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Model Context Protocol is an open standard for letting AI agents call
        tools from external services. Drop the snippet for your client below,
        plug in an API key, and your agent can generate, list, and fetch
        images.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3" role="list">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <Icon className="size-4" />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {feature.title}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
