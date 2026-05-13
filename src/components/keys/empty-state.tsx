"use client";

import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state shown on `/dashboard/keys` when the user has no keys.
 * Friendly, calm — dashed border + a single primary CTA, per the
 * Open Studio design system.
 */
export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-card/50 p-12 text-center"
      role="region"
      aria-label="No API keys yet"
    >
      <div
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <KeyRound className="size-5" />
      </div>

      <div className="space-y-1.5">
        <p className="font-display text-xl font-medium">No keys yet</p>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Your AI agents authenticate to Get Images with API keys. Create one
          and drop it into your MCP client to start generating.
        </p>
      </div>

      <Button type="button" onClick={onCreate} className="mt-2">
        Create your first key
      </Button>
    </div>
  );
}
