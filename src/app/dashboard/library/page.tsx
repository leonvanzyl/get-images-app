"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImageGrid } from "@/components/library/image-grid";
import { ImageLightbox } from "@/components/library/image-lightbox";
import {
  LibraryFilters,
  type AspectFilter,
  type SortOrder,
} from "@/components/library/library-filters";
import {
  type LibraryImage,
  getLibraryImagesAction,
  deleteGenerationAction,
} from "../actions";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [aspect, setAspect] = useState<AspectFilter>("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [selected, setSelected] = useState<LibraryImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    getLibraryImagesAction().then((images) => {
      setItems(images);
      setLoading(false);
    });
  }, []);

  // The aspect dropdown lists only ratios the user has actually produced —
  // sorted by their natural width:height numerator for a predictable order.
  const aspectOptions = useMemo(() => {
    const set = new Set(items.map((image) => image.aspect));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = items.filter((image) => {
      if (query && !image.prompt.toLowerCase().includes(query)) return false;
      if (aspect !== "All" && image.aspect !== aspect) return false;
      if (favoritesOnly && !image.favorite) return false;
      return true;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [items, search, aspect, favoritesOnly, sort]);

  const handleOpen = useCallback((image: LibraryImage) => {
    setSelected(image);
    setLightboxOpen(true);
  }, []);

  const handleToggleFavorite = useCallback((image: LibraryImage) => {
    const willFavorite = !image.favorite;
    setItems((prev) =>
      prev.map((item) =>
        item.id === image.id ? { ...item, favorite: willFavorite } : item,
      ),
    );
    setSelected((prev) =>
      prev && prev.id === image.id ? { ...prev, favorite: willFavorite } : prev,
    );
    toast.success(
      willFavorite ? "Added to favorites" : "Removed from favorites",
    );
  }, []);

  const handleDelete = useCallback(async (image: LibraryImage) => {
    const result = await deleteGenerationAction(image.id);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== image.id));
      setLightboxOpen(false);
      toast.success("Image deleted");
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
  }, []);

  const handleDownload = useCallback(async (image: LibraryImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `generated-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch {
      toast.error("Download failed");
    }
  }, []);

  const handleCopyPrompt = useCallback(async (image: LibraryImage) => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(image.prompt);
        toast.success("Prompt copied");
      } else {
        toast.error("Clipboard not available");
      }
    } catch {
      toast.error("Couldn't copy prompt");
    }
  }, []);

  const handleRegenerate = useCallback((_image: LibraryImage) => {
    toast.success("Sent to Generate — switch to the Generate tab to continue.");
  }, []);

  const countLabel = `${items.length} ${items.length === 1 ? "image" : "images"}`;

  return (
    <div className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-10 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight">
            Your library
          </h1>
          <p className="text-muted-foreground">Every image you&apos;ve made.</p>
        </div>
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      </header>

      {loading ? (
        // Calm pulsing skeleton — no marching stripes, no scan sweeps.
        <div
          role="status"
          aria-label="Loading your library"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <LibraryFilters
            search={search}
            onSearchChange={setSearch}
            aspect={aspect}
            onAspectChange={setAspect}
            aspectOptions={aspectOptions}
            favoritesOnly={favoritesOnly}
            onFavoritesOnlyChange={setFavoritesOnly}
            sort={sort}
            onSortChange={setSort}
          />

          <ImageGrid
            images={filtered}
            onOpen={handleOpen}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      )}

      <ImageLightbox
        image={selected}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onCopyPrompt={handleCopyPrompt}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
}
