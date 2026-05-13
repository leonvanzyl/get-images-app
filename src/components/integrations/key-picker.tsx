"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApiKeyView } from "@/components/keys/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstallSnippets } from "./install-snippets";

export interface KeyPickerProps {
  /** Active (non-revoked) keys to choose between. */
  keys: ApiKeyView[];
  selectedKeyId: string | null;
  onChange: (id: string) => void;
}

export interface IntegrationKeySelectionProps {
  keys: ApiKeyView[];
}

/**
 * Shows the saved key identifier the user should pair with the install
 * snippets. The full secret is only shown at creation time, so snippets keep a
 * placeholder for the saved value.
 */
export function KeyPicker({ keys, selectedKeyId, onChange }: KeyPickerProps) {
  if (keys.length === 0) {
    return (
      <section
        aria-labelledby="key-picker-empty-heading"
        className="bg-secondary rounded-2xl border p-6"
      >
        <p id="key-picker-empty-heading" className="font-display text-lg font-medium">
          No active keys yet
        </p>
        <p className="text-muted-foreground mt-1 max-w-prose text-sm">
          You&apos;ll need an active API key to wire up an integration. Create one, save the full
          secret, and paste it into the snippets below.
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
          className="text-foreground text-sm font-medium"
        >
          Saved key:
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
                  <span className="text-muted-foreground font-mono text-xs">{key.displayKey}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Link
        href="/dashboard/keys"
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
      >
        Manage keys
      </Link>
    </section>
  );
}

export function IntegrationKeySelection({ keys }: IntegrationKeySelectionProps) {
  const firstKeyId = keys[0]?.id ?? null;
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(firstKeyId);
  return (
    <>
      <KeyPicker keys={keys} selectedKeyId={selectedKeyId} onChange={setSelectedKeyId} />
      <InstallSnippets apiKey="{KEY}" />
    </>
  );
}
