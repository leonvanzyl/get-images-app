"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MockApiKey } from "@/lib/mock-data";

export interface KeyPickerProps {
  /** Active (non-revoked) keys to choose between. */
  keys: MockApiKey[];
  selectedKeyId: string | null;
  onChange: (id: string) => void;
}

/**
 * Strip that drives which key the install snippets below render with. When no
 * active key exists we swap in a destructive prompt instead — we don't want to
 * inline a placeholder string and pretend the user has something to copy.
 */
export function KeyPicker({ keys, selectedKeyId, onChange }: KeyPickerProps) {
  if (keys.length === 0) {
    return (
      <section
        aria-labelledby="key-picker-empty-heading"
        className="rounded-none border border-destructive/60 bg-destructive/5 p-6"
      >
        <p
          id="key-picker-empty-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-destructive"
        >
          02 — NO ACTIVE KEYS
        </p>
        <p className="mt-2 max-w-prose text-sm text-foreground">
          You need an active API key to wire up an integration. Create one and
          the snippets below will fill in automatically.
        </p>
        <Button
          asChild
          className="glow-lime mt-4 rounded-none px-5 font-mono text-xs uppercase tracking-[0.18em]"
        >
          <Link href="/dashboard/keys">Create a key →</Link>
        </Button>
      </section>
    );
  }

  // Fall back to the first key when the parent hasn't seeded the id yet or
  // the selected id was removed — keeps the UI from showing a blank trigger.
  const selected = keys.find((k) => k.id === selectedKeyId) ?? keys[0]!;

  return (
    <section
      aria-labelledby="key-picker-heading"
      className="rounded-none border border-border/60 bg-card/40"
    >
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-6">
        <div className="flex min-w-0 flex-col gap-2">
          <p
            id="key-picker-heading"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            02 — USE KEY FOR SNIPPETS
          </p>
          <Select value={selected.id} onValueChange={onChange}>
            <SelectTrigger className="w-full min-w-[280px] rounded-none border-border/60 bg-background/60 font-mono text-sm sm:w-[420px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border/60">
              {keys.map((key) => (
                <SelectItem
                  key={key.id}
                  value={key.id}
                  className="rounded-none font-mono text-sm"
                >
                  {key.name} · {key.prefix}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span
              aria-hidden="true"
              className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.9_0.22_130/0.7)]"
            />
            <span>USING —</span>
            <span className="text-foreground">{selected.name}</span>
          </div>
          <Link
            href="/dashboard/keys"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Manage keys →
          </Link>
        </div>
      </div>
    </section>
  );
}
