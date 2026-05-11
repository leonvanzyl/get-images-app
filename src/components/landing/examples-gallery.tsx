import Image from "next/image";
import Link from "next/link";

type Example = {
  id: string;
  seed: string;
  prompt: string;
  model: string;
  aspect: "4/5" | "1/1" | "3/4";
  size: string;
};

const EXAMPLES: Example[] = [
  {
    id: "001",
    seed: "getimg-1",
    prompt: "tokyo at 4am in the rain, cinestill 800t, anamorphic 35mm",
    model: "GET-IMG-3 · SEED 1042",
    aspect: "4/5",
    size: "800/1000",
  },
  {
    id: "002",
    seed: "getimg-2",
    prompt: "a single ceramic vase on a brutalist plinth, north light",
    model: "GET-IMG-3 · SEED 8821",
    aspect: "1/1",
    size: "900/900",
  },
  {
    id: "003",
    seed: "getimg-3",
    prompt: "an astronaut sketching on the moon, ink wash on rice paper",
    model: "GET-IMG-3 · SEED 4476",
    aspect: "3/4",
    size: "900/1200",
  },
  {
    id: "004",
    seed: "getimg-4",
    prompt:
      "a glass elevator descending through the canopy of a vertical forest at dusk",
    model: "GET-IMG-3 · SEED 2018",
    aspect: "4/5",
    size: "800/1000",
  },
  {
    id: "005",
    seed: "getimg-5",
    prompt: "an editorial portrait of a falconer, kodachrome, side lit",
    model: "GET-IMG-3 · SEED 6133",
    aspect: "1/1",
    size: "900/900",
  },
  {
    id: "006",
    seed: "getimg-6",
    prompt:
      "a parking garage flooded with bioluminescent water, long exposure",
    model: "GET-IMG-3 · SEED 9904",
    aspect: "4/5",
    size: "800/1000",
  },
];

const ASPECT_CLASS: Record<Example["aspect"], string> = {
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "3/4": "aspect-[3/4]",
};

export function ExamplesGallery() {
  return (
    <section
      id="examples"
      aria-labelledby="examples-heading"
      className="border-b border-border/60"
    >
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:py-32">
        <header className="mb-12 flex flex-col gap-4 border-l border-primary/40 pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            03 — EXAMPLES
          </p>
          <h2
            id="examples-heading"
            className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl"
          >
            From prompt to plate.
          </h2>
          <p className="max-w-xl text-base text-muted-foreground">
            Six recent runs from the lab. Hover any frame for the original
            prompt.
          </p>
        </header>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {EXAMPLES.map((ex) => (
            <figure
              key={ex.id}
              className="bracket-frame group relative mb-4 block break-inside-avoid border border-border/60 bg-card"
            >
              <div className={`relative w-full ${ASPECT_CLASS[ex.aspect]}`}>
                <Image
                  src={`https://picsum.photos/seed/${ex.seed}/${ex.size}`}
                  alt={`Example ${ex.id}: ${ex.prompt}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                {/* Hover caption overlay */}
                <figcaption className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[oklch(0.05_0.008_240/0.95)] via-[oklch(0.05_0.008_240/0.55)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="space-y-1.5 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                      {ex.id}
                    </p>
                    <p className="text-sm leading-snug text-foreground/95">
                      &ldquo;{ex.prompt}&rdquo;
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {ex.model}
                    </p>
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="#examples"
            className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            View all examples →
          </Link>
        </div>
      </div>
    </section>
  );
}
