"use client";

import { useMemo, useState } from "react";
import { ExamplePrompts } from "@/components/integrations/example-prompts";
import { InstallSnippets } from "@/components/integrations/install-snippets";
import { KeyPicker } from "@/components/integrations/key-picker";
import { McpOverview } from "@/components/integrations/mcp-overview";
import { MOCK_KEYS } from "@/lib/mock-data";

/**
 * Wave 3d — Integrations.
 *
 * The page owns the selected-key state so the picker and the install snippets
 * stay in sync without prop-drilling through an intermediary. We default to
 * the first active key and fall back to a `{KEY}` placeholder only when there
 * are no active keys at all (which the picker also surfaces as a destructive
 * empty state).
 */
export default function IntegrationsPage() {
  const activeKeys = useMemo(
    () => MOCK_KEYS.filter((k) => k.status === "active"),
    [],
  );

  const firstActiveKeyId = activeKeys[0]?.id ?? null;
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(
    firstActiveKeyId,
  );

  const selectedKey =
    activeKeys.find((k) => k.id === selectedKeyId) ?? activeKeys[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-12 p-8">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.9_0.22_130/0.7)] animate-cursor-blink"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            04 — INTEGRATIONS
          </p>
        </div>

        <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-balance md:text-6xl">
          Plug your agents in.
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Get Images speaks Model Context Protocol — any MCP client (Claude,
          Cursor, Windsurf, custom) gets a brush.
        </p>
      </header>

      <McpOverview />

      <KeyPicker
        keys={activeKeys}
        selectedKeyId={selectedKeyId}
        onChange={setSelectedKeyId}
      />

      <InstallSnippets apiKey={selectedKey?.prefix ?? "{KEY}"} />

      <ExamplePrompts />
    </div>
  );
}
