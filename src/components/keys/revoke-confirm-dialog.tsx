"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MockApiKey } from "@/lib/mock-data";

type Props = {
  apiKey: MockApiKey | null;
  onClose: () => void;
  onConfirm: (apiKey: MockApiKey) => void;
};

/**
 * Destructive confirmation for revoking an API key. The parent controls
 * visibility by passing a `MockApiKey` (visible) or `null` (hidden); this
 * decouples the dialog from owning its own open state so the page can manage
 * multiple per-row actions without juggling refs.
 */
export function RevokeConfirmDialog({ apiKey, onClose, onConfirm }: Props) {
  const open = apiKey !== null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onClose();
    }
  }

  function handleConfirm() {
    if (!apiKey) return;
    onConfirm(apiKey);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 rounded-none border-border bg-card sm:max-w-[460px]">
        {apiKey && (
          <>
            <DialogHeader>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Revoke key
              </p>
              <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
                Revoke this key?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Agents using this key will stop working immediately. You
                can&apos;t undo this.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Key
              </p>
              <span
                className="inline-flex w-fit items-center border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-xs tracking-tight text-foreground"
                aria-label={`Key prefix ${apiKey.prefix}`}
              >
                {apiKey.prefix}
              </span>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="rounded-none font-mono text-xs uppercase tracking-[0.18em]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                className="rounded-none font-mono text-xs uppercase tracking-[0.18em]"
              >
                Revoke key
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
