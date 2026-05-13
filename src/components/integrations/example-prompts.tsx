import Link from "next/link";

/**
 * Small inline hint that links to a few example prompts in the playground.
 *
 * This used to be a full three-card "Example prompts" section. The new
 * Integrations page no longer renders it inline; we keep the export as a
 * minimal, friendly hint so any future caller (or the integrations page,
 * if we choose to re-introduce it) gets a single, calm line instead of
 * a tutorial wall.
 */
const EXAMPLES: Array<{ label: string; prompt: string }> = [
  {
    label: "Hero image",
    prompt:
      "Make me a hero image for a blog post about minimalist kitchens, 16:9, warm light.",
  },
  {
    label: "Recent images",
    prompt: "Show me the last 5 images I generated this week.",
  },
  {
    label: "Save to folder",
    prompt: "Grab the latest image and put it in our brand assets.",
  },
];

export function ExamplePrompts() {
  return (
    <p className="text-sm text-muted-foreground">
      Try one of these:{" "}
      {EXAMPLES.map((example, index) => (
        <span key={example.label}>
          {index > 0 && <span aria-hidden="true">, </span>}
          <Link
            href="/dashboard"
            title={example.prompt}
            className="text-primary underline-offset-4 transition-colors hover:underline"
          >
            {example.label}
          </Link>
        </span>
      ))}
      .
    </p>
  );
}
