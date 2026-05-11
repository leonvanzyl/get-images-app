"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DashboardSidebar,
  type DashboardUser,
} from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

/**
 * Shared chrome wrapper for the dashboard. Server layout passes the session
 * user; this client component owns the mobile sheet state so that the topbar
 * hamburger and the sidebar nav can coordinate without prop-drilling through
 * the page tree.
 */
export function DashboardChrome({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr] bg-background text-foreground">
      <aside className="hidden md:block border-r border-border bg-sidebar">
        <DashboardSidebar user={user} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <DashboardTopbar
          user={user}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-sidebar border-r border-border"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Get Images navigation</SheetTitle>
            <SheetDescription>
              Primary navigation for the Get Images dashboard.
            </SheetDescription>
          </SheetHeader>
          <DashboardSidebar
            user={user}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
