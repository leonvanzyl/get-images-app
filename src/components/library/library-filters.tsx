"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASPECT_RATIOS,
  STYLE_PRESETS,
  type AspectRatio,
  type StylePreset,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type AspectFilter = "All" | AspectRatio;
export type StyleFilter = "All" | StylePreset;
export type SortOrder = "newest" | "oldest" | "prompt";

const FIELD_LABEL =
  "text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-1";

const SHARP_TRIGGER =
  "h-10 w-full rounded-none border-border/60 bg-background/40 font-mono text-xs uppercase tracking-[0.14em]";

type LibraryFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  aspect: AspectFilter;
  onAspectChange: (value: AspectFilter) => void;
  style: StyleFilter;
  onStyleChange: (value: StyleFilter) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  sort: SortOrder;
  onSortChange: (value: SortOrder) => void;
  filteredCount: number;
  totalCount: number;
};

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "prompt", label: "Most recent prompt" },
];

export function LibraryFilters({
  search,
  onSearchChange,
  aspect,
  onAspectChange,
  style,
  onStyleChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  sort,
  onSortChange,
  filteredCount,
  totalCount,
}: LibraryFiltersProps) {
  return (
    <div className="sticky top-14 z-20 flex flex-wrap items-end gap-4 border-y border-border/60 bg-background/85 p-4 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="flex min-w-[220px] flex-1 flex-col">
        <label htmlFor="library-search" className={FIELD_LABEL}>
          Search
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="library-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search prompts…"
            className="h-10 rounded-none border-border/60 bg-background/40 pl-9 font-mono text-xs uppercase tracking-[0.12em] placeholder:normal-case placeholder:text-muted-foreground/70 placeholder:tracking-normal"
          />
        </div>
      </div>

      <div className="flex w-[120px] flex-col">
        <label htmlFor="library-aspect" className={FIELD_LABEL}>
          Aspect
        </label>
        <Select
          value={aspect}
          onValueChange={(value) => onAspectChange(value as AspectFilter)}
        >
          <SelectTrigger id="library-aspect" className={SHARP_TRIGGER}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none font-mono text-xs uppercase tracking-[0.14em]">
            <SelectItem value="All">All</SelectItem>
            {ASPECT_RATIOS.map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                {ratio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-[160px] flex-col">
        <label htmlFor="library-style" className={FIELD_LABEL}>
          Style
        </label>
        <Select
          value={style}
          onValueChange={(value) => onStyleChange(value as StyleFilter)}
        >
          <SelectTrigger id="library-style" className={SHARP_TRIGGER}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none font-mono text-xs uppercase tracking-[0.14em]">
            <SelectItem value="All">All</SelectItem>
            {STYLE_PRESETS.map((preset) => (
              <SelectItem key={preset} value={preset}>
                {preset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        <span className={FIELD_LABEL}>Favorites</span>
        <button
          type="button"
          role="switch"
          aria-checked={favoritesOnly}
          aria-label="Show favorites only"
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
          className={cn(
            "inline-flex h-10 items-center gap-2 border border-border/60 bg-background/40 px-3 font-mono text-xs uppercase tracking-[0.16em] transition-colors",
            "hover:border-primary/60 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
            favoritesOnly
              ? "border-primary/70 text-primary"
              : "text-muted-foreground",
          )}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ★
          </span>
          <span>{favoritesOnly ? "[ON]" : "[OFF]"}</span>
        </button>
      </div>

      <div className="flex w-[200px] flex-col">
        <label htmlFor="library-sort" className={FIELD_LABEL}>
          Sort
        </label>
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as SortOrder)}
        >
          <SelectTrigger id="library-sort" className={SHARP_TRIGGER}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none font-mono text-xs uppercase tracking-[0.14em]">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex flex-col items-end">
        <span className={FIELD_LABEL}>Count</span>
        <div className="flex h-10 items-center border border-border/60 bg-background/40 px-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
          <span className="text-foreground">
            {String(filteredCount).padStart(3, "0")}
          </span>
          <span className="mx-1.5 text-muted-foreground/40">/</span>
          <span>{String(totalCount).padStart(3, "0")}</span>
          <span className="ml-2 text-muted-foreground/60">FRAMES</span>
        </div>
      </div>
    </div>
  );
}
