"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Download, Sparkles, Star, Trash2, X } from "lucide-react";
import type { LibraryImage } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AspectRatio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-video",
  "2:3": "aspect-[2/3]",
  "4:5": "aspect-[4/5]",
};

function getAspectClass(aspect: string): string {
  return ASPECT_CLASS[aspect as AspectRatio] ?? "aspect-square";
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function formatCreated(iso: string): string {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart.toUpperCase()} · ${timePart}`;
}

type ImageLightboxProps = {
  image: LibraryImage | null;
  totalCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite: (image: LibraryImage) => void;
  onDelete: (image: LibraryImage) => void;
  onDownload: (image: LibraryImage) => void;
  onCopyPrompt: (image: LibraryImage) => void;
  onRegenerate: (image: LibraryImage) => void;
};

export function ImageLightbox({
  image,
  totalCount,
  open,
  onOpenChange,
  onToggleFavorite,
  onDelete,
  onDownload,
  onCopyPrompt,
  onRegenerate,
}: ImageLightboxProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Reset the inline confirm state whenever the dialog swaps to a different
  // frame so a destructive prompt never carries over to another image.
  // Uses the "store prior value in state" pattern (React docs: "Adjusting
  // State Based on a Prop Change") instead of useEffect → setState, which
  // triggers cascading renders.
  const [prevImageId, setPrevImageId] = useState<string | null>(
    image?.id ?? null,
  );
  if (image && image.id !== prevImageId) {
    setPrevImageId(image.id);
    setConfirmDelete(false);
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setConfirmDelete(false);
    }
    onOpenChange(next);
  };

  if (!image) return null;

  const frameLabel = `${shortId(image.id)} / ${String(totalCount).padStart(3, "0")}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-6xl gap-0 rounded-none border border-border/60 bg-card p-0",
          "max-h-[calc(100vh-2rem)] overflow-hidden",
          "sm:max-w-6xl",
        )}
      >
        <DialogTitle className="sr-only">{`Frame ${shortId(image.id)} — ${image.prompt}`}</DialogTitle>
        <DialogDescription className="sr-only">
          Full metadata, actions, and a large preview for this generated frame.
        </DialogDescription>

        <div className="grid max-h-[calc(100vh-2rem)] grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative flex items-center justify-center border-b border-border/60 bg-background/60 p-6 lg:border-b-0 lg:border-r">
            <CornerTicks />
            <div
              className={cn(
                "relative w-full overflow-hidden border border-border/60 bg-background/40",
                getAspectClass(image.aspect),
              )}
            >
              <Image
                src={image.url}
                alt={image.prompt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="relative flex max-h-[calc(100vh-2rem)] flex-col bg-card">
            <button
              type="button"
              aria-label="Close"
              onClick={() => handleOpenChange(false)}
              className={cn(
                "absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center border border-border/60 bg-background/60 text-muted-foreground transition-colors",
                "hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              )}
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            <div className="flex-1 overflow-auto px-6 pb-4 pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Frame inspector
              </p>
              <h2
                className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground"
              >
                {frameLabel}
              </h2>

              <dl className="mt-6 grid grid-cols-[88px_1fr] gap-x-4 gap-y-3 text-sm">
                <MetaRow label="Frame">
                  <span className="font-mono tabular-nums text-foreground">
                    {frameLabel}
                  </span>
                </MetaRow>
                <MetaRow label="Prompt">
                  <span className="block text-pretty text-base leading-relaxed text-foreground">
                    {image.prompt}
                  </span>
                </MetaRow>
                <MetaRow label="Model">
                  <span className="font-mono text-foreground">
                    {image.model}
                  </span>
                </MetaRow>
                <MetaRow label="Seed">
                  <span className="font-mono tabular-nums text-foreground">
                    {image.seed}
                  </span>
                </MetaRow>
                <MetaRow label="Aspect">
                  <span className="font-mono text-foreground">
                    {image.aspect}
                  </span>
                </MetaRow>
                <MetaRow label="Style">
                  <span className="font-mono text-foreground">
                    {image.style}
                  </span>
                </MetaRow>
                <MetaRow label="Created">
                  <span className="font-mono text-foreground">
                    {formatCreated(image.createdAt)}
                  </span>
                </MetaRow>
              </dl>
            </div>

            <div className="border-t border-border/60 bg-background/40 px-4 py-3">
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-auto font-mono text-[10px] uppercase tracking-[0.18em] text-destructive">
                    Delete frame {shortId(image.id)}?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                    className="h-9 rounded-none font-mono text-xs uppercase tracking-[0.18em]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(image)}
                    className="h-9 rounded-none font-mono text-xs uppercase tracking-[0.18em]"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" />
                    Confirm delete
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  <ActionButton onClick={() => onDownload(image)}>
                    <Download aria-hidden="true" className="size-3.5" />
                    Download
                  </ActionButton>
                  <ActionButton onClick={() => onCopyPrompt(image)}>
                    <Copy aria-hidden="true" className="size-3.5" />
                    Copy prompt
                  </ActionButton>
                  <ActionButton onClick={() => onRegenerate(image)}>
                    <Sparkles aria-hidden="true" className="size-3.5" />
                    Regenerate
                  </ActionButton>
                  <ActionButton
                    onClick={() => onToggleFavorite(image)}
                    active={image.favorite ?? false}
                    aria-pressed={image.favorite ?? false}
                  >
                    <Star
                      aria-hidden="true"
                      className={cn(
                        "size-3.5",
                        image.favorite && "fill-primary",
                      )}
                    />
                    {image.favorite ? "Favorited" : "Favorite"}
                  </ActionButton>
                  <div className="ml-auto flex items-center gap-1.5">
                    <ActionButton
                      onClick={() => setConfirmDelete(true)}
                      destructive
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                      Delete
                    </ActionButton>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenChange(false)}
                      className="h-9 rounded-none border-border/60 font-mono text-xs uppercase tracking-[0.18em]"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

function ActionButton({
  children,
  onClick,
  destructive = false,
  active = false,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  destructive?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-none border border-transparent px-2.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors",
        "hover:border-border hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        active && "border-primary/60 text-primary hover:text-primary",
        destructive &&
          "text-destructive hover:border-destructive/60 hover:text-destructive",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function CornerTicks() {
  return (
    <>
      <span className="pointer-events-none absolute left-3 top-3 font-mono text-xs text-muted-foreground/70">
        +
      </span>
      <span className="pointer-events-none absolute right-3 top-3 font-mono text-xs text-muted-foreground/70">
        +
      </span>
      <span className="pointer-events-none absolute bottom-3 left-3 font-mono text-xs text-muted-foreground/70">
        +
      </span>
      <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-xs text-muted-foreground/70">
        +
      </span>
    </>
  );
}
