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
 * Picks which key gets baked into the install snippets below. When no active
 * key exists we surface a friendly nudge instead of inlining a placeholder.
 */
export function KeyPicker({ keys, selectedKeyId, onChange }: KeyPickerProps) {
  if (keys.length === 0) {
    return (
      <section
        aria-labelledby="key-picker-empty-heading"
        className="rounded-2xl border bg-secondary p-6"
      >
        <p
          id="key-picker-empty-heading"
          className="font-display text-lg font-medium"
        >
          No active keys yet
        </p>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          You&apos;ll need an active API key to wire up an integration. Create
          one and the snippets below will fill in automatically.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/keys">Create a key</Link>
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
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <label
          id="key-picker-heading"
          htmlFor="integrations-key-select"
          className="text-sm font-medium text-foreground"
        >
          Use key:
        </label>
        <Select value={selected.id} onValueChange={onChange}>
          <SelectTrigger
            id="integrations-key-select"
            className="h-10 min-w-[280px] rounded-[10px] sm:w-[360px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {keys.map((key) => (
              <SelectItem key={key.id} value={key.id}>
                <span className="text-sm">
                  {key.name}{" "}
                  <span className="font-mono text-xs text-muted-foreground">
                    {key.prefix}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Link
        href="/dashboard/keys"
        className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Manage keys
      </Link>
    </section>
  );
}
