"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { Check, Loader2 } from "lucide-react";

/**
 * A looping mock that shows what it feels like when a coding agent calls
 * Get Images. Left = a Claude-Code-style terminal walking through a tool call.
 * Right = a fake landing page whose hero image gets replaced live after the
 * agent has both received the image and written it into the component.
 *
 * Step model (ordering is load-bearing — the website only reacts after the
 * agent stops generating and starts editing):
 *   0 — idle, cursor blink
 *   1 — user prompt visible
 *   2 — agent acknowledges + "thinking…"
 *   3 — tool call in flight ("Generating…")
 *   4 — tool returned ✓, agent starts editing Hero.tsx; website shows "Updating…"
 *   5 — edit complete ✓, agent prints "Done"; website reveals the image
 *   6 — brief hold before loop
 */

const HERO_IMAGE_URL = "/demo.png";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STEP_DURATIONS: Record<Step, number> = {
  0: 1200,
  1: 2000,
  2: 1400,
  3: 2400,
  4: 2200,
  5: 3500,
  6: 1100,
};

const TOTAL_STEPS = 7;

export function LiveDemo() {
  const [step, setStep] = useState<Step>(0);
  const [imageReady, setImageReady] = useState(false);

  // Preload the result image so the reveal is instant when step 5 hits.
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImageReady(true);
    img.src = HERO_IMAGE_URL;
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStep((current) => ((current + 1) % TOTAL_STEPS) as Step);
    }, STEP_DURATIONS[step]);
    return () => clearTimeout(timeout);
  }, [step]);

  const showPrompt = step >= 1;
  const showThinking = step >= 2;
  const showToolCall = step >= 3;
  const toolReturned = step >= 4;
  const showEdit = step >= 4;
  const editComplete = step >= 5;
  const showDone = step >= 5;

  // Website lifecycle: idle (no image) → updating (spinner) → ready (image).
  const websitePhase: WebsitePhase =
    step >= 5 && imageReady ? "ready" : step === 4 ? "updating" : "idle";

  return (
    <section
      id="live-demo"
      aria-labelledby="live-demo-heading"
      className="border-t bg-secondary/30"
    >
      <div className="container mx-auto max-w-6xl px-6 py-20 md:py-28">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Live demo</p>
          <h2
            id="live-demo-heading"
            className="mt-3 font-display text-3xl font-medium tracking-tight text-balance md:text-4xl"
          >
            Watch an agent use it.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Your coding agent calls Get Images like any other MCP tool.
            Here&apos;s what that looks like end to end — terminal on the left,
            the page being built on the right.
          </p>
        </header>

        <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <Terminal
            showPrompt={showPrompt}
            showThinking={showThinking}
            showToolCall={showToolCall}
            toolReturned={toolReturned}
            showEdit={showEdit}
            editComplete={editComplete}
            showDone={showDone}
          />

          <WebsiteMock phase={websitePhase} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Terminal mock                                                      */
/* ------------------------------------------------------------------ */

function Terminal({
  showPrompt,
  showThinking,
  showToolCall,
  toolReturned,
  showEdit,
  editComplete,
  showDone,
}: {
  showPrompt: boolean;
  showThinking: boolean;
  showToolCall: boolean;
  toolReturned: boolean;
  showEdit: boolean;
  editComplete: boolean;
  showDone: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-[oklch(0.18_0.008_60)] text-[oklch(0.92_0.005_80)] shadow-sm">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full bg-[oklch(0.72_0.18_30)]"
          />
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full bg-[oklch(0.85_0.16_85)]"
          />
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full bg-[oklch(0.78_0.14_150)]"
          />
        </div>
        <p className="ml-2 font-mono text-xs text-white/50">
          ~/projects/my-app — claude-code
        </p>
      </div>

      {/* Terminal body */}
      <div className="flex-1 space-y-3 px-5 py-5 font-mono text-[13px] leading-relaxed">
        {/* User prompt */}
        <div>
          <span className="text-[oklch(0.78_0.16_35)]">❯</span>{" "}
          <span className="text-white/70">claude</span>
        </div>
        {showPrompt ? (
          <div className="animate-fade-in">
            <p className="text-white/95">
              <span className="text-[oklch(0.78_0.16_35)]">You </span>
              Generate a hero image for our landing page — a vintage red coupe
              in a brutalist parking garage at golden hour. Drop it into the
              &lt;Hero/&gt; component.
            </p>
          </div>
        ) : (
          <p className="text-white/30">Type your message…</p>
        )}

        {/* Agent reasoning */}
        {showThinking && (
          <div className="animate-fade-in space-y-2 pt-1">
            <p>
              <span className="text-[oklch(0.78_0.14_150)]">Claude </span>
              <span className="text-white/85">
                I&apos;ll generate that with Get Images.
              </span>
            </p>
            {!showToolCall && (
              <p className="flex items-center gap-2 text-white/50">
                <Loader2
                  className="size-3 animate-spin"
                  aria-hidden="true"
                />
                Thinking…
              </p>
            )}
          </div>
        )}

        {/* Tool call */}
        {showToolCall && (
          <div className="animate-fade-in space-y-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-xs text-white/50">
              <span className="text-[oklch(0.78_0.16_35)]">▸</span> Tool call ·{" "}
              <span className="text-white/70">get-images.generate_image</span>
            </p>
            <pre className="m-0 overflow-x-auto text-[12px] text-white/80">
              <code>{`{
  "prompt": "Vintage red coupe in a brutalist parking garage at golden hour, anamorphic flare",
  "model": "google/gemini-3-pro-image-preview",
  "aspectRatio": "16:9"
}`}</code>
            </pre>
            <p className="flex items-center gap-2 pt-1 text-xs text-white/50">
              {toolReturned ? (
                <>
                  <Check
                    className="size-3 text-[oklch(0.78_0.14_150)]"
                    aria-hidden="true"
                  />
                  <span>Returned 1 image · 12 credits</span>
                </>
              ) : (
                <>
                  <Loader2
                    className="size-3 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Generating…</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Edit step — agent now writes the image into the component */}
        {showEdit && (
          <div className="animate-fade-in space-y-2 pt-1">
            <p>
              <span className="text-[oklch(0.78_0.14_150)]">Claude </span>
              <span className="text-white/85">
                Got it. Updating{" "}
                <span className="text-[oklch(0.78_0.16_35)]">
                  src/components/Hero.tsx
                </span>
                …
              </span>
            </p>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
              <p className="flex items-center gap-2 text-xs text-white/50">
                {editComplete ? (
                  <>
                    <Check
                      className="size-3 text-[oklch(0.78_0.14_150)]"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="text-white/70">Hero.tsx</span>{" "}
                      <span className="text-[oklch(0.78_0.14_150)]">+3</span>{" "}
                      <span className="text-[oklch(0.72_0.18_30)]">−1</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2
                      className="size-3 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Writing file…</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Done message */}
        {showDone && (
          <div className="animate-fade-in space-y-1 pt-1">
            <p>
              <span className="text-[oklch(0.78_0.14_150)]">Claude </span>
              <span className="text-white/85">
                Done. The hero image is wired into your landing page.
              </span>
            </p>
            <p className="text-white/40">
              <span className="text-[oklch(0.78_0.16_35)]">❯</span>
              <span className="animate-pulse"> ▍</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Website mock                                                       */
/* ------------------------------------------------------------------ */

type WebsitePhase = "idle" | "updating" | "ready";

function WebsiteMock({ phase }: { phase: WebsitePhase }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Browser chrome */}
      <div className="relative flex items-center gap-3 border-b bg-secondary/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full bg-destructive/60"
          />
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full bg-amber-400/70"
          />
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full bg-emerald-500/70"
          />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-full bg-card px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
            my-app.com
          </div>
        </div>
        <div className="size-2.5" aria-hidden="true" />

        {/* Hot-reload progress bar — visible while the agent writes the file. */}
        {phase === "updating" && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-primary/15"
          >
            <span className="block size-full origin-left animate-pulse bg-primary" />
          </span>
        )}
      </div>

      {/* Fake site */}
      <div className="flex-1 bg-background">
        {/* Site header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-primary" aria-hidden="true" />
            <span className="font-display text-sm font-medium">MyApp</span>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="text-xs text-muted-foreground">Product</span>
            <span className="text-xs text-muted-foreground">Pricing</span>
            <span className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background">
              Sign up
            </span>
          </div>
        </div>

        {/* Hero region */}
        <div className="px-5 py-6">
          <div className="mb-3 h-3 w-32 rounded-full bg-muted" />
          <p className="font-display text-xl font-medium tracking-tight">
            Build something great.
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            The fastest way to ship your idea this weekend.
          </p>

          {/* Image slot */}
          <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
            {phase === "ready" ? (
              <NextImage
                src={HERO_IMAGE_URL}
                alt="Generated hero"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="animate-fade-in object-cover"
              />
            ) : phase === "updating" ? (
              <>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 animate-pulse bg-muted"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Loader2
                    className="size-5 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Updating component…
                  </p>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <div className="grid size-9 place-items-center rounded-md border border-dashed">
                  <div
                    aria-hidden="true"
                    className="size-3 rounded-sm bg-muted-foreground/30"
                  />
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  hero image
                </p>
              </div>
            )}
          </div>

          {/* Fake buttons */}
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-24 rounded-md bg-primary" />
            <div className="h-7 w-20 rounded-md border" />
          </div>
        </div>
      </div>
    </div>
  );
}
