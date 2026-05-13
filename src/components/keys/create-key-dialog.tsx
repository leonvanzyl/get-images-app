"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Fires only after the user has confirmed (in step 2) that they stored the
   * key. The page strips `fullKey` before persisting into the visible list.
   */
  onCreated: (apiKey: MockApiKey) => void;
};

type Step = "name" | "reveal";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Use the Web Crypto RNG so the mocked key strings look like real entropy
 * rather than `Math.random()` slop. `getRandomValues` is synchronous and
 * universally available in modern browsers / Node 19+.
 */
function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    const byte = bytes[i] ?? 0;
    out += ALPHABET[byte % ALPHABET.length];
  }
  return out;
}

function rand4(): string {
  return randomChars(4);
}

function rand24(): string {
  return randomChars(24);
}

/**
 * Two-step key creation dialog.
 *
 * Step 1 collects a recognizable name. Step 2 reveals the freshly-minted full
 * key exactly once and requires a "I stored this" checkbox before the parent
 * is allowed to commit the key to its list. The `fullKey` is held locally and
 * never persists past the dialog's lifetime.
 */
export function CreateKeyDialog({ open, onOpenChange, onCreated }: Props) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<MockApiKey | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  function resetState() {
    setStep("name");
    setName("");
    setNewKey(null);
    setConfirmed(false);
    setCopied(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const minted: MockApiKey = {
      id: crypto.randomUUID(),
      name: trimmed,
      prefix: `gi_live_${rand4()}••••••${rand4()}`,
      fullKey: `gi_live_${rand4()}_${rand24()}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      status: "active",
    };
    setNewKey(minted);
    setStep("reveal");
  }

  async function handleCopy() {
    if (!newKey?.fullKey) return;
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
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
    toast.success("Key created");
    handleOpenChange(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCreate();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 rounded-[20px] border bg-card p-8 sm:max-w-md">
        {step === "name" ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                New key
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
                Examples: Production, Dev — local, Cursor agent.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={!name.trim()}
              >
                Create key
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-display text-2xl font-medium tracking-tight">
                Save your key now
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                This is the only time you&apos;ll see the full key. Copy it
                into your password manager or MCP config before closing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Your new key</Label>
              <div className="flex items-center gap-2 rounded-[10px] border bg-secondary p-2">
                <code
                  className="flex-1 overflow-x-auto px-2 py-1 font-mono text-sm text-foreground"
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
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
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
                  "relative mt-0.5 grid size-4 shrink-0 place-items-center rounded border bg-background transition-colors",
                  "peer-checked:border-primary peer-checked:bg-primary",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-offset-2",
                )}
              >
                {confirmed && (
                  <Check className="size-3 text-primary-foreground" />
                )}
              </span>
              <span className="text-sm text-muted-foreground transition-colors peer-checked:text-foreground">
                I&apos;ve stored this key in a safe place.
              </span>
            </label>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                onClick={handleDone}
                disabled={!confirmed}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
