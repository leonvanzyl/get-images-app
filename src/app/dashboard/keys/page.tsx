"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateKeyDialog } from "@/components/keys/create-key-dialog";
import { DeleteConfirmDialog } from "@/components/keys/delete-confirm-dialog";
import { EmptyState } from "@/components/keys/empty-state";
import { KeyTable } from "@/components/keys/key-table";
import { RevokeConfirmDialog } from "@/components/keys/revoke-confirm-dialog";
import { Button } from "@/components/ui/button";
import { MOCK_KEYS, type MockApiKey } from "@/lib/mock-data";

export default function ApiKeysPage() {
  const [items, setItems] = useState<MockApiKey[]>(MOCK_KEYS);
  const [createOpen, setCreateOpen] = useState(false);
  const [revoking, setRevoking] = useState<MockApiKey | null>(null);
  const [deleting, setDeleting] = useState<MockApiKey | null>(null);

  const activeCount = useMemo(
    () => items.filter((key) => key.status === "active").length,
    [items],
  );

  /**
   * The dialog hands us the freshly-minted key including `fullKey`. We never
   * persist the full secret to the listing — the spec is explicit that the
   * full value is shown exactly once at creation time.
   */
  function handleCreated(key: MockApiKey) {
    const { fullKey: _fullKey, ...withoutFullKey } = key;
    void _fullKey;
    setItems((current) => [withoutFullKey, ...current]);
  }

  function handleRevoke(key: MockApiKey) {
    setItems((current) =>
      current.map((existing) =>
        existing.id === key.id ? { ...existing, status: "revoked" } : existing,
      ),
    );
    toast.success("Key revoked");
  }

  function handleDelete(key: MockApiKey) {
    setItems((current) => current.filter((existing) => existing.id !== key.id));
    toast.success("Key deleted");
  }

  return (
    <section className="p-6 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border/60 pb-8">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            03 — API Keys
          </p>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
            Your keys.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="text-foreground/80 tabular-nums">
              {activeCount} active
            </span>
            <span aria-hidden="true" className="mx-2 text-muted-foreground/40">
              ·
            </span>
            <span className="tabular-nums">{items.length} total</span>
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          onClick={() => setCreateOpen(true)}
          className="glow-lime h-11 rounded-none px-6 font-mono text-xs uppercase tracking-[0.18em]"
        >
          <Plus className="size-3.5" />
          New key
        </Button>
      </header>

      <aside
        role="note"
        aria-label="API key safety"
        className="mt-8 flex gap-4 border border-border/60 bg-card/40 p-5"
      >
        <span
          aria-hidden="true"
          className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_oklch(0.9_0.22_130/0.6)]"
        />
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            Treat keys like passwords
          </p>
          <p className="font-mono text-[12.5px] leading-relaxed text-muted-foreground">
            Keys are how your agents authenticate. We only ever show the full
            key once, at creation. Store it in a password manager or your MCP
            client config before closing the reveal dialog.
          </p>
        </div>
      </aside>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <KeyTable
            items={items}
            onRevoke={setRevoking}
            onDelete={setDeleting}
          />
        )}
      </div>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      <RevokeConfirmDialog
        apiKey={revoking}
        onClose={() => setRevoking(null)}
        onConfirm={handleRevoke}
      />

      <DeleteConfirmDialog
        apiKey={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
