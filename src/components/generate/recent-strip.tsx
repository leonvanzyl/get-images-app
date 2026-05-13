"use client";

import Image from "next/image";
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

/**
 * Horizontal row of recent session generations. Each thumb is a small rounded
 * square (the source images are loaded with `object-cover`) so the strip reads
 * as a tidy band of recent runs. Clicking a thumb re-loads it into the stage.
 */
export function RecentStrip({ items, current, onSelect }: RecentStripProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recent-strip-label" className="flex flex-col gap-3">
      <h2
        id="recent-strip-label"
        className="font-display text-lg font-medium"
      >
        Recent
      </h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {items.map((image) => {
          const selected = current?.id === image.id;
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image)}
              aria-pressed={selected}
              aria-label={`Open: ${image.prompt}`}
              title={image.prompt}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border bg-card transition-all",
                selected
                  ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
