"use client";

import Link from "next/link";
import type { LibraryImage } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { ImageCard } from "./image-card";

type ImageGridProps = {
  images: LibraryImage[];
  onOpen: (image: LibraryImage) => void;
  onToggleFavorite: (image: LibraryImage) => void;
};

export function ImageGrid({
  images,
  onOpen,
  onToggleFavorite,
}: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
        <p className="font-display text-xl font-medium">Nothing here yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Generate your first image — or adjust your filters to see more.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Start generating</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
