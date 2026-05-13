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
import { cn } from "@/lib/utils";
import type { ApiKeyView } from "./types";

type Props = {
  items: ApiKeyView[];
  onRevoke: (apiKey: ApiKeyView) => void;
  onDelete: (apiKey: ApiKeyView) => void;
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
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
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

function StatusBadge({ status }: { status: ApiKeyView["status"] }) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="bg-primary/10 text-primary rounded-full border-transparent px-2.5 py-0.5 text-xs font-medium"
      >
        Active
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-muted text-muted-foreground rounded-full border-transparent px-2.5 py-0.5 text-xs font-medium"
    >
      Revoked
    </Badge>
  );
}

function CopyDisplayKeyButton({ displayKey }: { displayKey: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(displayKey, "Key identifier copied");
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
      aria-label={`Copy key identifier ${displayKey}`}
      className="text-muted-foreground hover:text-foreground size-7"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

export function KeyTable({ items, onRevoke, onDelete }: Props) {
  async function handleCopyIdentifier(key: ApiKeyView) {
    await copyToClipboard(key.displayKey, "Key identifier copied");
  }

  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium">
              Name
            </TableHead>
            <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium">
              Key
            </TableHead>
            <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium">
              Created
            </TableHead>
            <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium">
              Last used
            </TableHead>
            <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium">
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
                className={cn("hover:bg-accent/50 transition-colors", revoked && "opacity-60")}
              >
                <TableCell className="text-foreground px-4 py-3.5 text-sm font-medium">
                  {key.name}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <code
                      className={cn(
                        "text-foreground font-mono text-xs",
                        revoked && "decoration-muted-foreground/60 line-through"
                      )}
                    >
                      {key.displayKey}
                    </code>
                    <CopyDisplayKeyButton displayKey={key.displayKey} />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground px-4 py-3.5 text-sm">
                  {relativeTime(key.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground px-4 py-3.5 text-sm">
                  {relativeTime(key.lastRequest)}
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
                        className="text-muted-foreground hover:text-foreground size-8"
                        aria-label={`Actions for ${key.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => handleCopyIdentifier(key)}>
                        <Copy className="size-3.5" />
                        Copy identifier
                      </DropdownMenuItem>
                      {!revoked && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onRevoke(key)}>
                            Revoke
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(key)}>
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
