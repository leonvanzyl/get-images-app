"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DashboardSidebar, type DashboardUser } from "./dashboard-sidebar";

/**
 * Shared chrome wrapper for the dashboard.
 *
 * Desktop layout: a 240px sidebar on the left with no global topbar — each
 * dashboard page renders its own inline header. The sidebar is sticky and
 * fills the viewport height so long page content scrolls independently.
 *
 * Mobile layout: a slim top bar exposes a hamburger that opens the same
 * sidebar inside a left-aligned Sheet. Mobile sheet state lives here so the
 * sidebar can self-close on navigation without prop-drilling through pages.
 */
export function DashboardChrome({
  user,
  creditBalance,
  isImpersonating,
  impersonationTarget,
  children,
}: {
  user: DashboardUser;
  creditBalance: number;
  isImpersonating?: boolean;
  impersonationTarget?: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isImpersonating ? (
        <ImpersonationBanner
          targetName={impersonationTarget?.name ?? null}
          targetEmail={impersonationTarget?.email ?? null}
        />
      ) : null}
      <div className="md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen overflow-y-auto bg-sidebar md:block">
        <DashboardSidebar user={user} creditBalance={creditBalance} />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile-only slim header. Desktop has no global topbar by design. */}
        <header
          className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:hidden"
          role="banner"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2"
            aria-label="Get Images — Dashboard home"
          >
            <span
              aria-hidden="true"
              className="inline-block size-4 rounded-[5px] bg-primary"
            />
            <span className="font-display text-base font-medium tracking-tight text-foreground">
              get images
            </span>
          </Link>
        </header>

        <main className="flex-1">{children}</main>
      </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Get Images navigation</SheetTitle>
            <SheetDescription>
              Primary navigation for the Get Images dashboard.
            </SheetDescription>
          </SheetHeader>
          {/*
            Only mount the sidebar's content while open so the next-themes
            hook inside doesn't flash on a closed sheet, and so navigation
            handlers can close the sheet on click via the onNavigate callback.
          */}
          {mobileNavOpen ? (
            <DashboardSidebar
              user={user}
              creditBalance={creditBalance}
              onNavigate={() => setMobileNavOpen(false)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
