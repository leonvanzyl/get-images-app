"use client";

import { useMemo, useState } from "react";
import { InstallSnippets } from "@/components/integrations/install-snippets";
import { KeyPicker } from "@/components/integrations/key-picker";
import { McpOverview } from "@/components/integrations/mcp-overview";
import { MOCK_KEYS } from "@/lib/mock-data";

/**
 * Integrations page.
 *
 * The page owns the selected-key state so the picker and the install snippets
 * stay in sync without prop-drilling through an intermediary. We default to
 * the first active key and fall back to a `{KEY}` placeholder only when there
 * are no active keys at all (which the picker also surfaces as a friendly
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
    <section className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-10 space-y-2">
        <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
          Integrations
        </h1>
        <p className="text-muted-foreground">
          Hook your AI agents into Get Images via MCP.
        </p>
      </header>

      <div className="space-y-8">
        <McpOverview />

        <KeyPicker
          keys={activeKeys}
          selectedKeyId={selectedKeyId}
          onChange={setSelectedKeyId}
        />

        <InstallSnippets apiKey={selectedKey?.prefix ?? "{KEY}"} />
      </div>
    </section>
  );
}
