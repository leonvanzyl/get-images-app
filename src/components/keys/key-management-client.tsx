"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteApiKeyAction, revokeApiKeyAction } from "@/app/dashboard/keys/actions";
import { Button } from "@/components/ui/button";
import { CreateKeyDialog } from "./create-key-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { EmptyState } from "./empty-state";
import { KeyTable } from "./key-table";
import { RevokeConfirmDialog } from "./revoke-confirm-dialog";
import type { ApiKeyView, CreatedApiKeyView } from "./types";

type PendingAction = { type: "revoke"; id: string } | { type: "delete"; id: string } | null;

type Props = {
  initialKeys: ApiKeyView[];
};

export function KeyManagementClient({ initialKeys }: Props) {
  const [items, setItems] = useState<ApiKeyView[]>(initialKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [revoking, setRevoking] = useState<ApiKeyView | null>(null);
  const [deleting, setDeleting] = useState<ApiKeyView | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  function handleCreated(key: CreatedApiKeyView) {
    const { fullKey: _fullKey, ...withoutFullKey } = key;
    void _fullKey;
    setItems((current) => {
      const existing = current.find((item) => item.id === withoutFullKey.id);
      if (!existing) return [withoutFullKey, ...current];
      return current.map((item) => (item.id === withoutFullKey.id ? withoutFullKey : item));
    });
  }

  async function handleRevoke(key: ApiKeyView) {
    setPendingAction({ type: "revoke", id: key.id });
    try {
      const result = await revokeApiKeyAction(key.id);
      if (result.success) {
        setItems((current) =>
          current.map((item) => (item.id === result.data.id ? result.data : item))
        );
        setRevoking(null);
        toast.success("Key revoked");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Couldn't revoke the key");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete(key: ApiKeyView) {
    setPendingAction({ type: "delete", id: key.id });
    try {
      const result = await deleteApiKeyAction(key.id);
      if (result.success) {
        setItems((current) => current.filter((item) => item.id !== result.data.id));
        setDeleting(null);
        toast.success("Key deleted");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Couldn't delete the key");
    } finally {
      setPendingAction(null);
    }
  }

  const revokePending = pendingAction?.type === "revoke" && pendingAction.id === revoking?.id;
  const deletePending = pendingAction?.type === "delete" && pendingAction.id === deleting?.id;

  return (
    <section className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">API keys</h1>
          <p className="text-muted-foreground">Use these to authenticate agents and MCP clients.</p>
        </div>

        <Button type="button" onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="size-4" />
          New key
        </Button>
      </header>

      <aside
        role="note"
        aria-label="API key safety"
        className="bg-secondary text-muted-foreground mb-8 rounded-2xl border p-4 text-sm"
      >
        Keep these secret. Each key is shown once when created; save it somewhere safe.
      </aside>

      {items.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <KeyTable items={items} onRevoke={setRevoking} onDelete={setDeleting} />
      )}

      <CreateKeyDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />

      <RevokeConfirmDialog
        apiKey={revoking}
        pending={revokePending}
        onClose={() => setRevoking(null)}
        onConfirm={handleRevoke}
      />

      <DeleteConfirmDialog
        apiKey={deleting}
        pending={deletePending}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
