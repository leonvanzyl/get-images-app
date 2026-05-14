"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  deleteModelAction,
  seedDefaultModelsAction,
  toggleModelActiveAction,
} from "@/app/admin/models/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ModelFormDialog } from "./model-form-dialog";

type Row = {
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

export function ModelsPageClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle(row: Row) {
    startTransition(async () => {
      const res = await toggleModelActiveAction({
        id: row.id,
        isActive: !row.isActive,
      });
      if (res.success) {
        toast.success(row.isActive ? "Deactivated." : "Activated.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleDelete(row: Row, force: boolean) {
    if (force && !confirm(`Hard delete ${row.modelId}? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteModelAction({ id: row.id, force });
      if (res.success) {
        toast.success(force ? "Hard deleted." : "Deactivated.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleSeedDefaults() {
    if (
      !confirm(
        "Seed the registry with the 5 default models? Existing models are not modified.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await seedDefaultModelsAction();
      if (res.success) {
        const { inserted, skipped } = res.data!;
        if (inserted === 0) {
          toast.success(
            `All ${skipped} default models already exist — nothing to add.`,
          );
        } else {
          toast.success(
            `Added ${inserted} model(s)${skipped ? ` · ${skipped} already existed` : ""}.`,
          );
        }
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight">
            Models
          </h1>
          <p className="text-muted-foreground">
            The full model registry. Edits here propagate to the dashboard,
            API, and MCP server.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSeedDefaults}
            disabled={pending}
            className="gap-2"
          >
            <Sparkles className="size-4" />
            Seed defaults
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="size-4" />
            New model
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Provider
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Ratios
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                Base
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                Deep
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Thinking
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No models. Click "New model" to add one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className={cn(!row.isActive && "opacity-60")}>
                  <TableCell className="font-mono text-xs">{row.modelId}</TableCell>
                  <TableCell className="text-sm font-medium">{row.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.providerId}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.aspectRatios.map((r) => (
                        <span
                          key={r}
                          className="rounded-full border bg-card px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.creditCost}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.thinkingHighCreditCost ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.thinkingDefault ? `${row.thinkingDefault} → ${row.thinkingHigh}` : "—"}
                  </TableCell>
                  <TableCell>
                    {row.isActive ? (
                      <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Model actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(row);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggle(row)}
                          disabled={pending}
                        >
                          {row.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(row, true)}
                          disabled={pending}
                          variant="destructive"
                        >
                          Hard delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ModelFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />
    </>
  );
}
