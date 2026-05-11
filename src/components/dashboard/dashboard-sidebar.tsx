"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronUp,
  KeyRound,
  Library,
  LogOut,
  Plug,
  Sparkles,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type NavItem = {
  href: string;
  label: string;
  frame: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Generate", frame: "01", icon: Sparkles },
  {
    href: "/dashboard/library",
    label: "Library",
    frame: "02",
    icon: Library,
  },
  { href: "/dashboard/keys", label: "API Keys", frame: "03", icon: KeyRound },
  {
    href: "/dashboard/integrations",
    label: "Integrations",
    frame: "04",
    icon: Plug,
  },
];

// Mocked monthly usage — Wave 3 will replace this with derived state from the
// shared mock-data module if/when a generate page wires actual counters.
const MOCK_RUNS_USED = 47;
const MOCK_RUNS_QUOTA = 500;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    // Don't match nested /dashboard/* on the Generate link.
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function userInitial(user: DashboardUser): string {
  return (user.name?.[0] || user.email?.[0] || "U").toUpperCase();
}

export function DashboardSidebar({
  user,
  onNavigate,
}: {
  user: DashboardUser;
  /** Called after a nav item is clicked — used by the mobile sheet to close. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Normalize the optional callback to a stable handler so React/Next.js
  // typings stay happy under `exactOptionalPropertyTypes`.
  const handleNavigate = onNavigate ?? (() => {});
  const usagePercent = Math.min(
    100,
    Math.round((MOCK_RUNS_USED / MOCK_RUNS_QUOTA) * 100),
  );

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <nav
      aria-label="Dashboard navigation"
      className="flex h-full min-h-screen flex-col"
    >
      <div className="px-6 pt-6 pb-8">
        <Link
          href="/dashboard"
          onClick={handleNavigate}
          className="group inline-flex items-center gap-2"
          aria-label="Get Images — Dashboard home"
        >
          <span
            aria-hidden="true"
            className="inline-block size-2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)] animate-cursor-blink"
          />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-foreground">
            Get Images
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            / V0.1
          </span>
        </Link>
      </div>

      <ul className="flex-1 space-y-1 px-3" role="list">
        {NAV_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={handleNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 font-mono text-xs uppercase tracking-[0.18em] transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                  active &&
                    "border-l-2 border-primary -ml-px text-primary bg-accent/30 hover:text-primary",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-6 shrink-0 text-[10px] tracking-[0.16em]",
                    active ? "text-primary/80" : "text-muted-foreground/60",
                  )}
                >
                  {item.frame}
                </span>
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="flex items-center gap-1.5">
                  {active && (
                    <span
                      aria-hidden="true"
                      className="text-primary/80"
                    >
                      [
                    </span>
                  )}
                  <span>{item.label}</span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="text-primary/80"
                    >
                      ]
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mx-3 mb-4 mt-6 rounded-sm border border-border/60 bg-background/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Runs this month
        </p>
        <p className="mt-2 font-mono text-2xl text-foreground tabular-nums">
          {String(MOCK_RUNS_USED).padStart(3, "0")}{" "}
          <span className="text-muted-foreground/60">
            / {MOCK_RUNS_QUOTA}
          </span>
        </p>
        <div
          className="mt-3 h-1 w-full overflow-hidden bg-border"
          role="progressbar"
          aria-valuenow={MOCK_RUNS_USED}
          aria-valuemin={0}
          aria-valuemax={MOCK_RUNS_QUOTA}
          aria-label="Monthly run quota"
        >
          <div
            className="h-full bg-primary"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      <div className="border-t border-border px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left",
              "transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Avatar className="size-8">
              <AvatarImage
                src={user.image ?? ""}
                alt={user.name ?? "User"}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-xs">
                {userInitial(user)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name ?? "Account"}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {user.email ?? ""}
              </p>
            </div>
            <ChevronUp
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56"
          >
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
              <Link
                href="/profile"
                onClick={handleNavigate}
                className="flex items-center"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
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
    </nav>
  );
}
