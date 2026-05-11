"use client";

import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-bleed empty state shown on `/dashboard/keys` when the user has no keys.
 * Visually mirrors the rest of the dashboard chrome (mono eyebrow + Bricolage
 * display headline + lime CTA) so the page never feels like a half-built form.
 */
export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-6 border border-border/60 bg-card/40 p-16 text-center"
      role="region"
      aria-label="No API keys yet"
    >
      <div
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center border border-border/60 bg-background/40"
      >
        <KeyRound className="size-6 text-primary" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        No keys yet
      </p>

      <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Mint your first key.
      </h2>

      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Your AI agents authenticate to Get Images with API keys. Create one and
        drop it into your MCP client to start generating.
      </p>

      <Button
        type="button"
        size="lg"
        onClick={onCreate}
        className="glow-lime mt-2 h-11 rounded-none px-6 font-mono text-xs uppercase tracking-[0.18em]"
      >
        Create your first key →
      </Button>
    </div>
  );
}
