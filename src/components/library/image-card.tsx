"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { LibraryImage } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

/**
 * Map a `"w:h"` aspect string to a `CSSProperties.aspectRatio` value. Anything
 * we don't recognize falls back to a square so the card still renders sensibly.
 *
 * Kept inline (not exported) so the card stays self-contained and doesn't
 * depend on the legacy mock-data aspect union.
 */
function getAspectRatio(aspect: string): CSSProperties["aspectRatio"] {
  const match = /^(\d+):(\d+)$/.exec(aspect);
  if (!match) return "1 / 1";
  return `${match[1]} / ${match[2]}`;
}

type ImageCardProps = {
  image: LibraryImage;
  onOpen: (image: LibraryImage) => void;
  onToggleFavorite: (image: LibraryImage) => void;
};

/**
 * A library image tile.
 *
 * The card uses two sibling interactive elements inside a single positioned
 * wrapper rather than nesting `<button>` in `<button>` (invalid HTML):
 *
 *   1. A full-bleed "open" button that fills the card and lives behind the
 *      image and gradient.
 *   2. A small "favorite" button absolutely positioned above it.
 *
 * Both buttons are real `<button>` elements with their own focus rings.
 */
export function ImageCard({
  image,
  onOpen,
  onToggleFavorite,
}: ImageCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card shadow-sm",
        "card-interactive",
      )}
      style={{ aspectRatio: getAspectRatio(image.aspect) }}
    >
      {/* The "open" surface — fills the whole card, sits behind the favorite
          button and any visible hover chrome. */}
      <button
        type="button"
        onClick={() => onOpen(image)}
        aria-label={`Open image: ${image.prompt}`}
        className={cn(
          "absolute inset-0 z-0 block cursor-pointer text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
        )}
      >
        <span className="sr-only">{image.prompt}</span>
      </button>

      <Image
        src={image.url}
        alt={image.prompt}
        fill
        unoptimized
        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="pointer-events-none object-cover"
      />

      {/* Bottom gradient + truncated prompt — fades in on hover. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end",
          "bg-gradient-to-t from-black/40 to-transparent",
          "p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        )}
      >
        <p className="line-clamp-1 text-xs text-white">{image.prompt}</p>
      </div>

      {/* Favorite toggle — top-right, always interactive. */}
      <button
        type="button"
        onClick={() => onToggleFavorite(image)}
        aria-pressed={image.favorite}
        aria-label={
          image.favorite ? "Remove from favorites" : "Add to favorites"
        }
        className={cn(
          "absolute right-2 top-2 z-20 inline-flex size-8 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          image.favorite && "opacity-100",
          "hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
        )}
      >
        <Star
          aria-hidden="true"
          className={cn(
            "size-4",
            image.favorite ? "fill-primary text-primary" : "",
          )}
        />
      </button>
    </div>
  );
}
