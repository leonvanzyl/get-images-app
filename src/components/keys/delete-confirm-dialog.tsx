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
      <DialogContent className="gap-5 rounded-[20px] border bg-card p-8 sm:max-w-md">
        {apiKey && (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                Delete this key?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                This permanently removes the key from your account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 rounded-[10px] border bg-secondary p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Name</span>
                <span className="truncate text-foreground">{apiKey.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Prefix</span>
                <code className="font-mono text-xs text-foreground">
                  {apiKey.prefix}
                </code>
              </div>
            </div>

            {requiresTyping && (
              <div className="space-y-2">
                <Label
                  htmlFor="delete-key-confirm"
                  className="text-sm font-medium"
                >
                  Type{" "}
                  <span className="font-mono text-xs">
                    &quot;{apiKey.name}&quot;
                  </span>{" "}
                  to confirm
                </Label>
                <Input
                  id="delete-key-confirm"
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                  className="h-10 rounded-[10px]"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="delete-key-confirm-help"
                />
                <p
                  id="delete-key-confirm-help"
                  className="text-xs text-muted-foreground"
                >
                  Active keys require a name match before deletion.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={closeAndReset}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={!canDelete}
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
