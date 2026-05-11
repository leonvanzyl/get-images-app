"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { AspectRatio, MockImage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ASPECT_STYLE: Record<AspectRatio, CSSProperties> = {
  "1:1": { aspectRatio: "1 / 1" },
  "3:2": { aspectRatio: "3 / 2" },
  "16:9": { aspectRatio: "16 / 9" },
  "2:3": { aspectRatio: "2 / 3" },
  "4:5": { aspectRatio: "4 / 5" },
};

function truncatePrompt(prompt: string, max = 60): string {
  if (prompt.length <= max) return prompt;
  return `${prompt.slice(0, max).trimEnd()}…`;
}

type ImageCardProps = {
  image: MockImage;
  index: number;
  total: number;
  onOpen: (image: MockImage) => void;
};

export function ImageCard({ image, index, total, onOpen }: ImageCardProps) {
  const frameLabel = `${image.id} / ${String(total).padStart(3, "0")}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      aria-label={`Open frame ${image.id}: ${image.prompt}`}
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: "both",
      }}
      className={cn(
        "bracket-frame group relative mb-4 block w-full break-inside-avoid overflow-hidden border border-border/60 bg-card text-left",
        "cursor-pointer transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        "animate-fade-up opacity-0",
      )}
    >
      <div className="relative w-full" style={ASPECT_STYLE[image.aspect]}>
        <Image
          src={image.url}
          alt={image.prompt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        <span
          aria-hidden="true"
          className="absolute left-2 top-2 z-10 inline-flex items-center bg-[oklch(0.05_0.008_240/0.72)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/95 backdrop-blur-sm"
        >
          {frameLabel}
        </span>

        {image.favorite && (
          <span
            aria-label="Favorite"
            className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 bg-[oklch(0.05_0.008_240/0.72)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur-sm"
          >
            <Star aria-hidden="true" className="size-3 fill-primary" />
            <span>★</span>
          </span>
        )}

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10",
            "translate-y-2 bg-gradient-to-t from-[oklch(0.05_0.008_240/0.96)] via-[oklch(0.05_0.008_240/0.6)] to-transparent",
            "p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            Prompt
            <span className="mx-1.5 text-muted-foreground/60">—</span>
            <span className="text-foreground/85 normal-case tracking-normal">
              {truncatePrompt(image.prompt)}
            </span>
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {image.model}
            <span className="mx-1.5 text-muted-foreground/40">·</span>
            SEED {image.seed}
            <span className="mx-1.5 text-muted-foreground/40">·</span>
            {image.aspect}
          </p>
        </div>
      </div>
    </button>
  );
}
