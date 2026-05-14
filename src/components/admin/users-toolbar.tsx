"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Filter = "all" | "admin" | "user";
type BanFilter = "all" | "yes" | "no";

export function UsersToolbar({
  initialQuery,
  initialRole,
  initialBanned,
}: {
  initialQuery: string;
  initialRole: Filter;
  initialBanned: BanFilter;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const [, startTransition] = useTransition();

  function applyFilter(next: Partial<{ q: string; role: Filter; banned: BanFilter }>) {
    const p = new URLSearchParams(params?.toString() ?? "");
    if (next.q !== undefined) {
      if (next.q) p.set("q", next.q);
      else p.delete("q");
    }
    if (next.role !== undefined) {
      if (next.role === "all") p.delete("role");
      else p.set("role", next.role);
    }
    if (next.banned !== undefined) {
      if (next.banned === "all") p.delete("banned");
      else p.set("banned", next.banned);
    }
    p.delete("page");
    startTransition(() => {
      router.push(`/admin/users${p.toString() ? `?${p}` : ""}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilter({ q });
  }

  function chip<T extends string>(
    value: T,
    current: T,
    label: string,
    onClick: () => void,
  ) {
    const active = value === current;
    return (
      <button
        key={value}
        type="button"
        onClick={onClick}
        className={cn(
          "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
          active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSearchSubmit} className="relative sm:max-w-sm sm:flex-1">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email…"
          className="pl-9"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {chip<Filter>("all", initialRole, "All roles", () =>
          applyFilter({ role: "all" }),
        )}
        {chip<Filter>("admin", initialRole, "Admin", () =>
          applyFilter({ role: "admin" }),
        )}
        {chip<Filter>("user", initialRole, "User", () =>
          applyFilter({ role: "user" }),
        )}
        <span className="mx-2 self-center text-muted-foreground/40">|</span>
        {chip<BanFilter>("all", initialBanned, "Anyone", () =>
          applyFilter({ banned: "all" }),
        )}
        {chip<BanFilter>("no", initialBanned, "Active", () =>
          applyFilter({ banned: "no" }),
        )}
        {chip<BanFilter>("yes", initialBanned, "Banned", () =>
          applyFilter({ banned: "yes" }),
        )}
      </div>
    </div>
  );
}
