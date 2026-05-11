"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { signOut } from "@/lib/auth-client";
import type { DashboardUser } from "./dashboard-sidebar";

type PageDescriptor = {
  frame: string;
  label: string;
};

/**
 * Map known routes to their frame-numbered title. Falls back to a generic
 * dashboard label for any unmatched dashboard sub-route so Wave 3 sub-pages
 * keep working until they're wired here explicitly.
 */
const ROUTE_TITLES: Record<string, PageDescriptor> = {
  "/dashboard": { frame: "01", label: "Generate" },
  "/dashboard/library": { frame: "02", label: "Library" },
  "/dashboard/keys": { frame: "03", label: "API Keys" },
  "/dashboard/integrations": { frame: "04", label: "Integrations" },
};

function resolveTitle(pathname: string): PageDescriptor {
  const exact = ROUTE_TITLES[pathname];
  if (exact) {
    return exact;
  }
  // Match nested routes (e.g. /dashboard/library/abc) to the closest known prefix.
  const match = Object.keys(ROUTE_TITLES)
    .filter(
      (route) => route !== "/dashboard" && pathname.startsWith(`${route}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
  const matched = match ? ROUTE_TITLES[match] : undefined;
  if (matched) {
    return matched;
  }
  return { frame: "—", label: "Dashboard" };
}

function userInitial(user: DashboardUser): string {
  return (user.name?.[0] || user.email?.[0] || "U").toUpperCase();
}

export function DashboardTopbar({
  user,
  onMenuClick,
}: {
  user: DashboardUser;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { frame, label } = resolveTitle(pathname);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6"
      role="banner"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex min-w-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
        <span
          aria-hidden="true"
          className="text-muted-foreground/70 tabular-nums"
        >
          {frame}
        </span>
        <span aria-hidden="true" className="text-muted-foreground/40">
          —
        </span>
        <span className="truncate text-foreground">{label}</span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div
          className="hidden items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex"
          aria-label="System status"
        >
          <span
            aria-hidden="true"
            className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.9_0.22_130/0.7)] animate-cursor-blink"
          />
          <span>Live</span>
          <span aria-hidden="true" className="text-muted-foreground/40">
            /
          </span>
          <span className="text-foreground/70">SYS OK</span>
        </div>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-8 cursor-pointer transition-opacity hover:opacity-80">
              <AvatarImage
                src={user.image ?? ""}
                alt={user.name ?? "User"}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-xs">
                {userInitial(user)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                Your Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
