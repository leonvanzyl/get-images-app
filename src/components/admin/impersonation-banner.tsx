"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { stopImpersonatingAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";

/**
 * Sticky red banner shown while an admin is acting as another user. Rendered
 * by both AdminChrome and DashboardChrome — impersonation typically lands
 * the admin on `/dashboard`, but the banner must still surface inside
 * `/admin` if the operator navigates back there.
 */
export function ImpersonationBanner({
  targetName,
  targetEmail,
}: {
  targetName?: string | null;
  targetEmail?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleStop = () => {
    startTransition(async () => {
      const res = await stopImpersonatingAction();
      if (res.success) {
        router.replace("/admin/users");
        router.refresh();
      }
    });
  };

  const label = targetName ?? targetEmail ?? "another user";

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-destructive/40 bg-destructive px-4 py-2 text-sm text-destructive-foreground">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">
          Impersonating as {label}
          {targetEmail && targetName ? ` (${targetEmail})` : null}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleStop}
        disabled={pending}
        className="h-7 shrink-0"
      >
        {pending ? "Stopping…" : "Stop impersonating"}
      </Button>
    </div>
  );
}
