import Link from "next/link";

/**
 * Three illustrative prompts a user might give their agent once the MCP is
 * wired up. Each pairs a natural-language request with the concrete tool call
 * the agent would make — the visual mirror that closes the loop on the rest
 * of the page.
 */
type AgentExample = {
  label: string;
  prompt: string;
  call: string;
};

const EXAMPLES: AgentExample[] = [
  {
    label: "EXAMPLE PROMPT 01",
    prompt:
      "Make me a hero image for our blog post about minimalist kitchens — anamorphic 16:9, cinematic warm light.",
    call: `generate_image(prompt: "minimalist kitchen hero, anamorphic, cinematic warm light", aspect: "16:9", model: "openai/image-2")`,
  },
  {
    label: "EXAMPLE PROMPT 02",
    prompt: "Show me the last 5 frames I generated this week.",
    call: `list_generations(limit: 5)`,
  },
  {
    label: "EXAMPLE PROMPT 03",
    prompt: "Grab frame 004 and put it in our brand-assets folder.",
    call: `get_image(id: "004")`,
  },
];

export function ExamplePrompts() {
  return (
    <section
      aria-labelledby="example-prompts-heading"
      className="space-y-6"
    >
      <div className="space-y-2">
        <p
          id="example-prompts-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary"
        >
          04 — EXAMPLE PROMPTS
        </p>
        <p className="max-w-prose text-sm text-muted-foreground">
          Once the MCP is wired up, your agent calls the tools directly. A few
          shapes the conversation tends to take.
        </p>
      </div>

      <ul
        className="grid gap-4 md:grid-cols-3"
        role="list"
      >
        {EXAMPLES.map((example) => (
          <li
            key={example.label}
            className="flex flex-col gap-4 border border-border/60 bg-card/40 p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {example.label}
            </p>
            <blockquote className="border-l-2 border-primary/60 pl-3 text-sm italic leading-relaxed text-foreground/90">
              “{example.prompt}”
            </blockquote>
            <p className="mt-auto break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
              <span aria-hidden="true" className="text-primary">
                →
              </span>{" "}
              <span className="text-muted-foreground/80">Agent calls:</span>{" "}
              <code className="text-foreground/90">{example.call}</code>
            </p>
          </li>
        ))}
      </ul>

      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
        >
          Got the MCP wired up? Try a generation →
        </Link>
      </div>
    </section>
  );
}
