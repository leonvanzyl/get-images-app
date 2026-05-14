"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createModelAction,
  updateModelAction,
} from "@/app/admin/models/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SUPPORTED_ASPECT_RATIOS,
  SUPPORTED_PROVIDERS,
} from "@/services/image-generation/types";

type Editing = {
  id: string;
  modelId: string;
  providerId: string;
  providerModelId: string;
  name: string;
  description: string;
  aspectRatios: string[];
  thinkingDefault: string | null;
  thinkingHigh: string | null;
  creditCost: number;
  thinkingHighCreditCost: number | null;
  isActive: boolean;
  sortOrder: number;
};

const DEFAULTS: Omit<Editing, "id"> = {
  modelId: "",
  providerId: "openai",
  providerModelId: "",
  name: "",
  description: "",
  aspectRatios: ["1:1"],
  thinkingDefault: null,
  thinkingHigh: null,
  creditCost: 1,
  thinkingHighCreditCost: null,
  isActive: true,
  sortOrder: 0,
};

export function ModelFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Editing | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<Omit<Editing, "id">>(
    editing ? { ...editing } : DEFAULTS,
  );
  const [prevId, setPrevId] = useState<string | null>(editing?.id ?? null);
  if (editing && editing.id !== prevId) {
    setPrevId(editing.id);
    setForm({ ...editing });
  }
  if (!editing && prevId !== null) {
    setPrevId(null);
    setForm(DEFAULTS);
  }

  const isThinking = form.thinkingDefault !== null;

  function toggleAspect(r: string) {
    setForm((f) =>
      f.aspectRatios.includes(r)
        ? { ...f, aspectRatios: f.aspectRatios.filter((x) => x !== r) }
        : { ...f, aspectRatios: [...f.aspectRatios, r] },
    );
  }

  function setThinking(enabled: boolean) {
    setForm((f) => ({
      ...f,
      thinkingDefault: enabled ? (f.providerId === "google" ? "minimal" : null) : null,
      thinkingHigh: enabled ? "high" : null,
      thinkingHighCreditCost: enabled ? f.thinkingHighCreditCost : null,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...form,
        aspectRatios: form.aspectRatios as typeof SUPPORTED_ASPECT_RATIOS[number][],
        providerId: form.providerId as typeof SUPPORTED_PROVIDERS[number],
        thinkingDefault: form.thinkingDefault as "minimal" | "low" | null,
        thinkingHigh: form.thinkingHigh as "high" | null,
      };

      const res = editing
        ? await updateModelAction({ id: editing.id, ...payload })
        : await createModelAction(payload);
      if (res.success) {
        toast.success(editing ? "Model updated." : "Model created.");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[20px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium tracking-tight">
            {editing ? "Edit model" : "New model"}
          </DialogTitle>
          <DialogDescription>
            Models are stored in the registry and consumed by the dashboard,
            API, and MCP server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="m-modelid">Model ID</Label>
              <Input
                id="m-modelid"
                value={form.modelId}
                onChange={(e) => setForm({ ...form, modelId: e.target.value })}
                placeholder="openai:gpt-image-1.5"
                disabled={Boolean(editing)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Composite key — immutable after creation.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-provider">Provider</Label>
              <select
                id="m-provider"
                value={form.providerId}
                onChange={(e) =>
                  setForm({ ...form, providerId: e.target.value })
                }
                disabled={Boolean(editing)}
                className="flex h-10 w-full rounded-[10px] border bg-card px-3 text-sm"
              >
                {SUPPORTED_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-providermodelid">Provider model ID</Label>
              <Input
                id="m-providermodelid"
                value={form.providerModelId}
                onChange={(e) =>
                  setForm({ ...form, providerModelId: e.target.value })
                }
                placeholder="gpt-image-1.5"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="m-name">Display name</Label>
              <Input
                id="m-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="m-desc">Description</Label>
              <Textarea
                id="m-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Aspect ratios</Label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_ASPECT_RATIOS.map((r) => {
                const active = form.aspectRatios.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleAspect(r)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="m-cost">Credit cost</Label>
              <Input
                id="m-cost"
                type="number"
                min={1}
                value={form.creditCost}
                onChange={(e) =>
                  setForm({ ...form, creditCost: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-sort">Sort order</Label>
              <Input
                id="m-sort"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">Supports deep thinking</span>
              <input
                type="checkbox"
                checked={isThinking}
                onChange={(e) => setThinking(e.target.checked)}
                className="size-4 accent-primary"
              />
            </label>
            {isThinking ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default provider value</Label>
                  <select
                    value={form.thinkingDefault ?? "minimal"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        thinkingDefault: e.target.value as "minimal" | "low",
                      })
                    }
                    className="flex h-10 w-full rounded-[10px] border bg-card px-3 text-sm"
                  >
                    <option value="minimal">minimal</option>
                    <option value="low">low</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-deepcost">Deep credit cost</Label>
                  <Input
                    id="m-deepcost"
                    type="number"
                    min={1}
                    value={form.thinkingHighCreditCost ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        thinkingHighCreditCost: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="size-4 accent-primary"
            />
            Active (visible to users)
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Create model"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
