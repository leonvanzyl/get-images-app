"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Coins,
  Images,
  KeyRound,
  LogOut,
  MoonStar,
  MoreHorizontal,
  Plug,
  Sparkles,
  Sun,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
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
  icon: LucideIcon;
};

// Order is intentional — Generate is the primary action, then content, then
// account-adjacent surfaces.
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Generate", icon: Sparkles },
  { href: "/dashboard/library", label: "Library", icon: Images },
  { href: "/dashboard/keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
];

function isActiveRoute(pathname: string, href: string): boolean {
  // The Generate page lives at the dashboard root and must match exactly so
  // every nested dashboard route doesn't keep it highlighted.
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function userInitial(user: DashboardUser): string {
  return (user.name?.[0] || user.email?.[0] || "U").toUpperCase();
}

export function DashboardSidebar({
  user,
  creditBalance,
  onNavigate,
}: {
  user: DashboardUser;
  creditBalance: number;
  /** Called after a nav item is clicked — used by the mobile sheet to close. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  // Normalize the optional callback to a stable handler so React/Next.js
  // typings stay happy under `exactOptionalPropertyTypes`.
  const handleNavigate = onNavigate ?? (() => {});

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    router.refresh();
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      aria-label="Dashboard navigation"
      className="flex h-full flex-col bg-sidebar text-sidebar-foreground"
    >
      {/* Wordmark — calm, no blinking dot or version tag. */}
      <div className="px-6 pt-6 pb-8">
        <Link
          href="/dashboard"
          onClick={handleNavigate}
          className="inline-flex items-center gap-2.5"
          aria-label="Get Images — Dashboard home"
        >
          <span
            aria-hidden="true"
            className="inline-block size-5 rounded-[6px] bg-primary"
          />
          <span className="font-display text-lg font-medium tracking-tight text-foreground">
            get images
          </span>
        </Link>
      </div>

      {/* Primary navigation. Sentence case, plain icons, no frame numbers. */}
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
                  "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Credit balance card — soft, friendly, with a clear path to top up. */}
      <div className="px-3 pt-6 pb-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coins aria-hidden="true" className="size-4" />
            <span className="text-xs">Balance</span>
          </div>
          <p className="mt-2 text-foreground">
            <span className="font-mono text-2xl tracking-tight">
              {creditBalance}
            </span>
            <span className="ml-1.5 text-sm text-muted-foreground">
              credits
            </span>
          </p>
          <Link
            href="/pricing"
            onClick={handleNavigate}
            className="mt-3 inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Buy more
          </Link>
        </div>
      </div>

      {/* User block — avatar + name + small more-menu trigger. */}
      <div className="px-3 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left",
              "transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
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
              {user.email ? (
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              ) : null}
            </div>
            <MoreHorizontal
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user.name ? (
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                ) : null}
                {user.email ? (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                onClick={handleNavigate}
                className="flex items-center"
              >
                <UserIcon className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            {/*
              Theme toggle lives inside the user menu so the sidebar stays
              quiet. We avoid `onSelect` default close — letting the menu
              dismiss after toggling matches user expectation.
            */}
            <DropdownMenuItem onClick={toggleTheme}>
              {resolvedTheme === "dark" ? (
                <>
                  <Sun className="mr-2 size-4" />
                  Light mode
                </>
              ) : (
                <>
                  <MoonStar className="mr-2 size-4" />
                  Dark mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
