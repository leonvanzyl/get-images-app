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
        className="rounded-full border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
      >
        Active
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-full border-transparent bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
    >
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
      className="size-7 text-muted-foreground hover:text-foreground"
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

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Key
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Created
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Last used
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-12 px-4 py-3 text-right">
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
                  "transition-colors hover:bg-accent/50",
                  revoked && "opacity-60",
                )}
              >
                <TableCell className="px-4 py-3.5 text-sm font-medium text-foreground">
                  {key.name}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <code
                      className={cn(
                        "font-mono text-xs text-foreground",
                        revoked &&
                          "line-through decoration-muted-foreground/60",
                      )}
                    >
                      {key.prefix}
                    </code>
                    <CopyPrefixButton prefix={key.prefix} />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                  {relativeTime(key.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                  {relativeTime(key.lastUsedAt)}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <StatusBadge status={key.status} />
                </TableCell>
                <TableCell className="px-4 py-3.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        aria-label={`Actions for ${key.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => handleCopyPrefix(key)}>
                        <Copy className="size-3.5" />
                        Copy prefix
                      </DropdownMenuItem>
                      {!revoked && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onRevoke(key)}
                          >
                            Revoke
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(key)}
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
