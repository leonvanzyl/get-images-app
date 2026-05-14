"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Coins,
  LayoutDashboard,
  LogOut,
  MoonStar,
  MoreHorizontal,
  ScrollText,
  Sun,
  User as UserIcon,
  Users,
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

export type AdminUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/models", label: "Models", icon: Boxes },
  { href: "/admin/transactions", label: "Transactions", icon: Coins },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function userInitial(u: AdminUser): string {
  return (u.name?.[0] || u.email?.[0] || "A").toUpperCase();
}

export function AdminSidebar({
  user,
  onNavigate,
}: {
  user: AdminUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
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
      aria-label="Admin navigation"
      className="flex h-full flex-col bg-sidebar text-sidebar-foreground"
    >
      <div className="px-6 pt-6 pb-8">
        <Link
          href="/admin"
          onClick={handleNavigate}
          className="inline-flex items-center gap-2.5"
          aria-label="Get Images — Admin home"
        >
          <span
            aria-hidden="true"
            className="inline-block size-5 rounded-[6px] bg-primary"
          />
          <span className="font-display text-lg font-medium tracking-tight text-foreground">
            get images{" "}
            <span className="text-destructive">/ admin</span>
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

      <div className="px-3 pt-6 pb-3">
        <Link
          href="/dashboard"
          onClick={handleNavigate}
          className="flex items-center gap-3 rounded-[10px] border bg-card px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>

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
                alt={user.name ?? "Admin"}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-xs">{userInitial(user)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name ?? "Admin"}
              </p>
              {user.email ? (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
            <MoreHorizontal aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user.name ? (
                  <p className="text-sm font-medium leading-none">{user.name}</p>
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
