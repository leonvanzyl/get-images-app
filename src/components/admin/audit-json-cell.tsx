"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AuditJsonCell({
  before,
  after,
  notes,
  action,
}: {
  before: unknown;
  after: unknown;
  notes: string | null;
  action: string;
}) {
  const [open, setOpen] = useState(false);
  const hasPayload =
    (before !== null && before !== undefined) ||
    (after !== null && after !== undefined);

  if (!hasPayload && !notes) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <>
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-auto p-0 text-primary"
      >
        View
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[20px] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-medium tracking-tight">
              {action}
            </DialogTitle>
            {notes ? (
              <DialogDescription>{notes}</DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Before
              </p>
              <pre className="max-h-72 overflow-auto rounded-[10px] border bg-muted p-3 text-xs">
                {before ? JSON.stringify(before, null, 2) : "—"}
              </pre>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                After
              </p>
              <pre className="max-h-72 overflow-auto rounded-[10px] border bg-muted p-3 text-xs">
                {after ? JSON.stringify(after, null, 2) : "—"}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
