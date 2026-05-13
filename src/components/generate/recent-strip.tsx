"use client";

import Image from "next/image";
import { aspectDimensions, type AspectRatio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type RecentImage = {
  id: string;
  url: string;
  prompt: string;
  aspect: string;
};

type RecentStripProps = {
  items: RecentImage[];
  current: RecentImage | null;
  onSelect: (image: RecentImage) => void;
};

const LABEL_CLASS =
  "font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground";

/**
 * Horizontal scrolling strip of the current session's recent generations.
 * Each thumb is sized by its real aspect ratio so the strip reads as a
 * cohesive filmstrip rather than a uniform grid. Clicking a thumb hands the
 * image back to the page so the user can re-render variants against it.
 */
export function RecentStrip({ items, current, onSelect }: RecentStripProps) {
  if (items.length === 0) {
    return (
      <section aria-labelledby="recent-strip-label" className="flex flex-col gap-3">
        <p id="recent-strip-label" className={LABEL_CLASS}>
          Session — Recent
        </p>
        <div className="flex h-24 items-center justify-center border border-dashed border-border/60 bg-card/40 px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            No runs yet — generate to fill the strip.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="recent-strip-label" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p id="recent-strip-label" className={LABEL_CLASS}>
          Session — Recent
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 tabular-nums">
          {String(items.length).padStart(2, "0")} / 08
        </p>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {items.map((image) => {
          const selected = current?.id === image.id;
          const dims = aspectDimensions(image.aspect as AspectRatio);
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image)}
              aria-pressed={selected}
              aria-label={`Open frame ${image.id}: ${image.prompt}`}
              title={image.prompt}
              className={cn(
                "group/thumb relative h-20 shrink-0 overflow-hidden border bg-card",
                "transition-all",
                selected
                  ? "border-primary glow-lime"
                  : "border-border hover:border-foreground/40",
              )}
              style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
            >
              <Image
                src={image.url}
                alt=""
                fill
                unoptimized
                sizes="120px"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1 top-1 px-1 font-mono text-[9px] uppercase tracking-[0.18em]",
                  "bg-background/70 backdrop-blur-sm",
                  selected ? "text-primary" : "text-foreground/80",
                )}
              >
                {image.id}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
