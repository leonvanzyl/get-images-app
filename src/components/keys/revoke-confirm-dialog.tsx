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
import type { ApiKeyView } from "./types";

type Props = {
  apiKey: ApiKeyView | null;
  pending?: boolean;
  onClose: () => void;
  onConfirm: (apiKey: ApiKeyView) => void | Promise<void>;
};

/**
 * Destructive confirmation for revoking an API key. The parent controls
 * visibility by passing a key (visible) or `null` (hidden); this decouples the
 * dialog from owning its own open state so the page can manage multiple
 * per-row actions without juggling refs.
 */
export function RevokeConfirmDialog({ apiKey, pending = false, onClose, onConfirm }: Props) {
  const open = apiKey !== null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !pending) {
      onClose();
    }
  }

  function handleConfirm() {
    if (!apiKey || pending) return;
    void onConfirm(apiKey);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card gap-5 rounded-[20px] border p-8 sm:max-w-md">
        {apiKey && (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                Revoke this key?
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Agents using this key will stop working immediately. You can&apos;t undo this.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-secondary flex items-center justify-between gap-3 rounded-[10px] border px-3 py-2.5">
              <span className="text-muted-foreground text-xs">Key</span>
              <code
                className="text-foreground font-mono text-xs"
                aria-label={`Key identifier ${apiKey.displayKey}`}
              >
                {apiKey.displayKey}
              </code>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={pending}
              >
                {pending ? "Revoking..." : "Revoke key"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
