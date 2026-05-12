"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImageGrid } from "@/components/library/image-grid";
import { ImageLightbox } from "@/components/library/image-lightbox";
import {
  LibraryFilters,
  type AspectFilter,
  type SortOrder,
  type StyleFilter,
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
  const [style, setStyle] = useState<StyleFilter>("All");
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = items.filter((image) => {
      if (query && !image.prompt.toLowerCase().includes(query)) return false;
      if (aspect !== "All" && image.aspect !== aspect) return false;
      if (style !== "All" && image.style !== style) return false;
      if (favoritesOnly && !image.favorite) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sort === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else {
      sorted.sort((a, b) => a.prompt.localeCompare(b.prompt));
    }
    return sorted;
  }, [items, search, aspect, style, favoritesOnly, sort]);

  const styleCount = useMemo(() => {
    const set = new Set(items.map((i) => i.style));
    return set.size;
  }, [items]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setAspect("All");
    setStyle("All");
    setFavoritesOnly(false);
  }, []);

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
      willFavorite
        ? `Frame ${image.id.slice(0, 8)} added to favorites`
        : `Frame ${image.id.slice(0, 8)} removed from favorites`,
    );
  }, []);

  const handleDelete = useCallback(async (image: LibraryImage) => {
    const result = await deleteGenerationAction(image.id);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== image.id));
      setLightboxOpen(false);
      toast.success(`Frame deleted`);
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

  if (loading) {
    return (
      <section className="p-8">
        <header className="flex flex-col gap-3 border-l border-primary/40 pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            02 — Library
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] tracking-tight text-balance text-foreground md:text-6xl">
            Your reel.
          </h1>
        </header>
        <div className="mt-12 flex justify-center">
          <div className="film-progress h-1 w-48 border border-primary/30 opacity-80" />
        </div>
      </section>
    );
  }

  return (
    <section className="p-8">
      <header className="flex flex-col gap-3 border-l border-primary/40 pl-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          02 — Library
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] tracking-tight text-balance text-foreground md:text-6xl">
          Your reel.
        </h1>
        <p className="text-base text-muted-foreground">
          <span className="font-mono tabular-nums text-foreground">
            {String(items.length).padStart(3, "0")}
          </span>{" "}
          frames across{" "}
          <span className="font-mono tabular-nums text-foreground">
            {styleCount}
          </span>{" "}
          styles.
        </p>
      </header>

      <div className="mt-8">
        <LibraryFilters
          search={search}
          onSearchChange={setSearch}
          aspect={aspect}
          onAspectChange={setAspect}
          style={style}
          onStyleChange={setStyle}
          favoritesOnly={favoritesOnly}
          onFavoritesOnlyChange={setFavoritesOnly}
          sort={sort}
          onSortChange={setSort}
          filteredCount={filtered.length}
          totalCount={items.length}
        />

        <ImageGrid
          images={filtered}
          totalCount={items.length}
          onOpen={handleOpen}
          onClearFilters={clearFilters}
        />
      </div>

      <ImageLightbox
        image={selected}
        totalCount={items.length}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onCopyPrompt={handleCopyPrompt}
        onRegenerate={handleRegenerate}
      />
    </section>
  );
}
