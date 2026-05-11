"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MockApiKey } from "@/lib/mock-data";

type Props = {
  apiKey: MockApiKey | null;
  onClose: () => void;
  onConfirm: (apiKey: MockApiKey) => void;
};

/**
 * Permanent-delete confirmation. Active keys require the user to retype the
 * key name as a defensive guardrail (matches GitHub / Stripe convention);
 * already-revoked keys can be deleted in one click since the blast radius is
 * essentially nil.
 */
export function DeleteConfirmDialog({ apiKey, onClose, onConfirm }: Props) {
  const open = apiKey !== null;
  const requiresTyping = apiKey?.status === "active";
  const [typed, setTyped] = useState("");

  const expected = apiKey?.name.trim() ?? "";
  const canDelete = !requiresTyping || typed.trim() === expected;

  // Centralize "close" so the typed-confirm input never leaks across keys —
  // each open of the dialog (for a different key) starts from a clean string.
  function closeAndReset() {
    setTyped("");
    onClose();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      closeAndReset();
    }
  }

  function handleConfirm() {
    if (!apiKey || !canDelete) return;
    onConfirm(apiKey);
    closeAndReset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 rounded-none border-border bg-card sm:max-w-[480px]">
        {apiKey && (
          <>
            <DialogHeader>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Delete key
              </p>
              <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
                Delete this key?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                This permanently removes the key from your account.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Name
                </span>
                <span className="truncate text-sm text-foreground">
                  {apiKey.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Prefix
                </span>
                <span className="font-mono text-xs text-foreground">
                  {apiKey.prefix}
                </span>
              </div>
            </div>

            {requiresTyping && (
              <div className="grid gap-2">
                <Label
                  htmlFor="delete-key-confirm"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
                >
                  Type{" "}
                  <span className="text-foreground">
                    &quot;{apiKey.name}&quot;
                  </span>{" "}
                  to confirm
                </Label>
                <Input
                  id="delete-key-confirm"
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                  className="h-11 rounded-none border-border bg-background font-mono text-sm"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="delete-key-confirm-help"
                />
                <p
                  id="delete-key-confirm-help"
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70"
                >
                  Active keys require a name match before deletion.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={closeAndReset}
                className="rounded-none font-mono text-xs uppercase tracking-[0.18em]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={!canDelete}
                className="rounded-none font-mono text-xs uppercase tracking-[0.18em]"
              >
                Delete forever
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
