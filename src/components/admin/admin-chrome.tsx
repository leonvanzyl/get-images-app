"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminSidebar, type AdminUser } from "./admin-sidebar";
import { ImpersonationBanner } from "./impersonation-banner";

/**
 * Shared chrome wrapper for the admin section. Mirrors DashboardChrome but
 * with admin-specific navigation. When the operator is currently
 * impersonating another user, a sticky destructive banner is rendered at the
 * very top — it sits above the chrome so it's visible on every admin page.
 */
export function AdminChrome({
  user,
  isImpersonating,
  impersonationTarget,
  children,
}: {
  user: AdminUser;
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
          <AdminSidebar user={user} />
        </aside>

        <div className="flex min-w-0 flex-col">
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
              href="/admin"
              className="inline-flex items-center gap-2"
              aria-label="Get Images — Admin home"
            >
              <span
                aria-hidden="true"
                className="inline-block size-4 rounded-[5px] bg-primary"
              />
              <span className="font-display text-base font-medium tracking-tight text-foreground">
                get images <span className="text-destructive">/ admin</span>
              </span>
            </Link>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>
              Primary navigation for the Get Images admin area.
            </SheetDescription>
          </SheetHeader>
          {mobileNavOpen ? (
            <AdminSidebar user={user} onNavigate={() => setMobileNavOpen(false)} />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
