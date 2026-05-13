import { ImageIcon, Plug, Sparkles } from "lucide-react";

type Step = {
  title: string;
  description: string;
  Icon: typeof Sparkles;
};

const STEPS: Step[] = [
  {
    title: "1. Describe it",
    description:
      "Tell us what you want in plain English. No prompt-engineering rituals required.",
    Icon: Sparkles,
  },
  {
    title: "2. Pick a model",
    description:
      "Choose from OpenAI, Gemini, and more. Switch any time — your prompts stay portable.",
    Icon: ImageIcon,
  },
  {
    title: "3. Plug into your agent",
    description:
      "One MCP endpoint. Drop the key into Claude, Cursor, or anything that speaks MCP.",
    Icon: Plug,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-20"
    >
      <div className="container mx-auto max-w-6xl px-6 py-20 md:py-28">
        <header className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2
            id="how-it-works-heading"
            className="font-display text-3xl font-medium tracking-tight text-balance md:text-4xl"
          >
            Three steps. That&apos;s it.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Built for vibe coders and agentic builders. No SDK to learn, no
            dashboard hopping — just images where your agent already lives.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="rounded-2xl border bg-card p-8 shadow-sm"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-medium text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
