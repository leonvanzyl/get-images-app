"use client";

import type { LibraryImage } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { ImageCard } from "./image-card";

type ImageGridProps = {
  images: LibraryImage[];
  totalCount: number;
  onOpen: (image: LibraryImage) => void;
  onClearFilters: () => void;
};

export function ImageGrid({
  images,
  totalCount,
  onOpen,
  onClearFilters,
}: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="mt-8 border border-dashed border-border/60 bg-card/40 p-16 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          — empty reel —
        </p>
        <p className="mt-4 font-mono text-sm uppercase tracking-[0.18em] text-foreground">
          No frames match
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Try clearing the filters or searching for a different prompt.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="h-10 rounded-none border-border/60 font-mono text-xs uppercase tracking-[0.18em]"
          >
            Clear filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {images.map((image, index) => (
        <ImageCard
          key={image.id}
          image={image}
          index={index}
          total={totalCount}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
