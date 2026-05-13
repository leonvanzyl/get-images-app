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
      <DialogContent className="gap-5 rounded-[20px] border bg-card p-8 sm:max-w-md">
        {apiKey && (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                Revoke this key?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Agents using this key will stop working immediately. You
                can&apos;t undo this.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between gap-3 rounded-[10px] border bg-secondary px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Key</span>
              <code
                className="font-mono text-xs text-foreground"
                aria-label={`Key prefix ${apiKey.prefix}`}
              >
                {apiKey.prefix}
              </code>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
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
