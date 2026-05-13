"use client";

import { useState } from "react";
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
    <section className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            API keys
          </h1>
          <p className="text-muted-foreground">
            Use these to authenticate agents and MCP clients.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="gap-2"
        >
          <Plus className="size-4" />
          New key
        </Button>
      </header>

      <aside
        role="note"
        aria-label="API key safety"
        className="mb-8 rounded-2xl border bg-secondary p-4 text-sm text-muted-foreground"
      >
        Keep these secret. Each key is shown once when created — save it
        somewhere safe.
      </aside>

      {items.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <KeyTable
          items={items}
          onRevoke={setRevoking}
          onDelete={setDeleting}
        />
      )}

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
