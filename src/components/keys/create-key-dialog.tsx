"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { createApiKeyAction } from "@/app/dashboard/keys/actions";
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
import { cn } from "@/lib/utils";
import type { CreatedApiKeyView } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (apiKey: CreatedApiKeyView) => void;
};

type Step = "name" | "reveal";

/**
 * Two-step key creation dialog.
 *
 * Step 1 collects a recognizable name. Step 2 reveals the full key returned by
 * Better Auth exactly once and requires a "I stored this" checkbox before the
 * dialog closes. The parent strips `fullKey` before adding the row to the list.
 */
export function CreateKeyDialog({ open, onOpenChange, onCreated }: Props) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<CreatedApiKeyView | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  function resetState() {
    setStep("name");
    setName("");
    setNewKey(null);
    setConfirmed(false);
    setCopied(false);
    setCreating(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && creating) return;
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    try {
      const result = await createApiKeyAction(trimmed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setNewKey(result.data);
      toast.success("Key created");
      setStep("reveal");
    } catch {
      toast.error("Couldn't create the key");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy() {
    if (!newKey?.fullKey) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(newKey.fullKey);
        setCopied(true);
        toast.success("Key copied");
        // Brief icon swap; reset after a moment so further copies still feel responsive.
        window.setTimeout(() => setCopied(false), 1500);
      } else {
        toast.error("Clipboard not available");
      }
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  function handleDone() {
    if (!newKey || !confirmed) return;
    onCreated(newKey);
    handleOpenChange(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleCreate();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card gap-5 rounded-[20px] border p-8 sm:max-w-md">
        {step === "name" ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                New key
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Give it a name you&apos;ll recognize.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="create-key-name" className="text-sm font-medium">
                Key name
              </Label>
              <Input
                id="create-key-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Production"
                maxLength={64}
                className="h-10 rounded-[10px]"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-muted-foreground text-xs">
                Examples: Production, Dev — local, Cursor agent.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleCreate} disabled={!name.trim() || creating}>
                {creating ? "Creating..." : "Create key"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                Save your key now
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                This is the only time you&apos;ll see the full key. Copy it into your password
                manager or MCP config before closing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Your new key</Label>
              <div className="bg-secondary flex items-center gap-2 rounded-[10px] border p-2">
                <code
                  className="text-foreground block min-w-0 flex-1 overflow-x-auto px-2 py-1 font-mono text-sm whitespace-nowrap"
                  aria-label="Full API key"
                >
                  {newKey?.fullKey}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  aria-label="Copy key to clipboard"
                  className="gap-1.5"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="peer sr-only"
                aria-label="I've stored this key in a safe place"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "bg-background relative mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition-colors",
                  "peer-checked:border-primary peer-checked:bg-primary",
                  "peer-focus-visible:ring-ring/50 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                )}
              >
                {confirmed && <Check className="text-primary-foreground size-3" />}
              </span>
              <span className="text-muted-foreground peer-checked:text-foreground text-sm transition-colors">
                I&apos;ve stored this key in a safe place.
              </span>
            </label>

            <DialogFooter className="gap-2">
              <Button type="button" onClick={handleDone} disabled={!confirmed}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
