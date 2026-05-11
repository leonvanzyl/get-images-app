import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section
      id="start"
      aria-labelledby="cta-heading"
      className="relative scanlines bg-[oklch(0.07_0.008_240)]"
    >
      {/* LIVE marker */}
      <div className="pointer-events-none absolute top-6 right-6 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block size-1.5 rounded-full bg-primary animate-cursor-blink shadow-[0_0_8px_oklch(0.9_0.22_130/0.7)]"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          LIVE
        </span>
      </div>

      <div className="container mx-auto flex flex-col items-center gap-10 px-4 py-32 text-center sm:px-6 lg:py-40">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          04 — START
        </p>

        <h2
          id="cta-heading"
          className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-balance md:text-7xl lg:text-8xl"
        >
          Open the lens.
        </h2>

        <p className="max-w-md text-base text-muted-foreground sm:text-lg">
          Free during the demo. No credit card.
        </p>

        <div className="pt-2">
          <Button
            asChild
            size="lg"
            className="glow-lime rounded-none px-8 py-6 font-mono text-sm uppercase tracking-[0.18em]"
          >
            <Link href="/register">Start generating →</Link>
          </Button>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          INT — STUDIO — DAY &nbsp;·&nbsp; TAKE 001
        </p>
      </div>
    </section>
  );
}
