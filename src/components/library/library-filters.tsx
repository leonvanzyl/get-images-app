"use client";

import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Filter primitives.
 *
 * Aspect ratios are typed as `string` here because the list is derived from the
 * user's actual library — real DB rows may carry any ratio the model supports
 * (1:1, 16:9, 21:9, ...), and we don't want the filter to require the static
 * mock-data union.
 */
export type AspectFilter = string;
export type SortOrder = "newest" | "oldest";

type LibraryFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  aspect: AspectFilter;
  onAspectChange: (value: AspectFilter) => void;
  aspectOptions: string[];
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  sort: SortOrder;
  onSortChange: (value: SortOrder) => void;
};

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export function LibraryFilters({
  search,
  onSearchChange,
  aspect,
  onAspectChange,
  aspectOptions,
  favoritesOnly,
  onFavoritesOnlyChange,
  sort,
  onSortChange,
}: LibraryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search — sentence-case placeholder, leading icon. */}
      <div className="relative w-full max-w-xs">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="library-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search prompts"
          aria-label="Search prompts"
          className="h-10 rounded-[10px] pl-9"
        />
      </div>

      {/* Aspect ratio — populated from the user's actual data. */}
      <Select
        value={aspect}
        onValueChange={(value) => onAspectChange(value as AspectFilter)}
      >
        <SelectTrigger
          id="library-aspect"
          aria-label="Filter by aspect ratio"
          className="h-10 w-[150px] rounded-[10px]"
        >
          <SelectValue placeholder="All ratios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All ratios</SelectItem>
          {aspectOptions.map((ratio) => (
            <SelectItem key={ratio} value={ratio}>
              {ratio}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Favorites toggle — pill chip following DESIGN.md §5.5. */}
      <button
        type="button"
        role="switch"
        aria-checked={favoritesOnly}
        aria-label="Show favorites only"
        onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
          favoritesOnly
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        )}
      >
        <Star
          aria-hidden="true"
          className={cn("size-4", favoritesOnly && "fill-current")}
        />
        Favorites only
      </button>

      {/* Sort order — newest / oldest. */}
      <Select
        value={sort}
        onValueChange={(value) => onSortChange(value as SortOrder)}
      >
        <SelectTrigger
          id="library-sort"
          aria-label="Sort order"
          className="h-10 w-[130px] rounded-[10px]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
