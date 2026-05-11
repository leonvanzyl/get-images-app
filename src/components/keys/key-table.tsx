"use client";

import { useState } from "react";
import { Check, Copy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
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
import type { MockApiKey } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  items: MockApiKey[];
  onRevoke: (apiKey: MockApiKey) => void;
  onDelete: (apiKey: MockApiKey) => void;
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Lightweight relative-time formatter. Returns:
 * - "never" for null
 * - "just now" / "Nm ago" / "Nh ago" / "Nd ago" for recent values
 * - absolute `YYYY-MM-DD` for anything older than 90 days
 *
 * Inlined so this page has no extra runtime deps; matches the spec exactly.
 */
function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return "never";
  const diff = Date.now() - parsed;
  if (diff < 60_000) return "just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 90) return `${days}d ago`;
  const d = new Date(parsed);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Copy a string to the clipboard with toast feedback. Defensive across SSR /
 * old browsers — `navigator.clipboard` is not guaranteed to exist.
 */
async function copyToClipboard(value: string, label: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      await navigator.clipboard.writeText(value);
      toast.success(label);
      return true;
    }
    toast.error("Clipboard not available");
    return false;
  } catch {
    toast.error("Couldn't copy to clipboard");
    return false;
  }
}

function StatusBadge({ status }: { status: MockApiKey["status"] }) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 rounded-none border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary"
      >
        <span
          aria-hidden="true"
          className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.9_0.22_130/0.7)]"
        />
        Active
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1.5 rounded-none border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
    >
      <span
        aria-hidden="true"
        className="inline-block size-1.5 rounded-full bg-muted-foreground/60"
      />
      Revoked
    </Badge>
  );
}

function CopyPrefixButton({ prefix }: { prefix: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(prefix, "Prefix copied");
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      aria-label={`Copy prefix ${prefix}`}
      className="size-7 rounded-none text-muted-foreground hover:text-primary"
    >
      {copied ? (
        <Check className="size-3.5" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </Button>
  );
}

export function KeyTable({ items, onRevoke, onDelete }: Props) {
  async function handleCopyPrefix(key: MockApiKey) {
    await copyToClipboard(key.prefix, "Prefix copied");
  }

  function handleRotate() {
    toast.info("Coming soon", {
      description: "Key rotation lands with the live API.",
    });
  }

  return (
    <div className="border border-border/60 bg-card/40">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Key
            </TableHead>
            <TableHead className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Created
            </TableHead>
            <TableHead className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Last used
            </TableHead>
            <TableHead className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-12 px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((key) => {
            const revoked = key.status === "revoked";
            return (
              <TableRow
                key={key.id}
                className={cn(
                  "group transition-colors hover:bg-muted/20",
                  // Lime left-accent bar on row hover — applied to the first
                  // cell so it survives the table's collapse-border behavior.
                  "[&>td:first-child]:border-l-2 [&>td:first-child]:border-transparent",
                  "hover:[&>td:first-child]:border-primary",
                  revoked && "opacity-60",
                )}
              >
                <TableCell className="px-4 py-4 text-sm font-medium text-foreground">
                  {key.name}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <code
                      className={cn(
                        "font-mono text-xs text-foreground",
                        revoked && "line-through decoration-muted-foreground/60",
                      )}
                    >
                      {key.prefix}
                    </code>
                    <CopyPrefixButton prefix={key.prefix} />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {relativeTime(key.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {relativeTime(key.lastUsedAt)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <StatusBadge status={key.status} />
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-none text-muted-foreground hover:text-foreground"
                        aria-label={`Actions for ${key.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44 rounded-none border-border bg-popover"
                    >
                      <DropdownMenuItem
                        onClick={() => handleCopyPrefix(key)}
                        className="rounded-none font-mono text-[11px] uppercase tracking-[0.18em]"
                      >
                        <Copy className="size-3.5" />
                        Copy prefix
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleRotate}
                        className="rounded-none font-mono text-[11px] uppercase tracking-[0.18em]"
                      >
                        Rotate
                      </DropdownMenuItem>
                      {!revoked && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onRevoke(key)}
                            className="rounded-none font-mono text-[11px] uppercase tracking-[0.18em]"
                          >
                            Revoke
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(key)}
                        className="rounded-none font-mono text-[11px] uppercase tracking-[0.18em]"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
