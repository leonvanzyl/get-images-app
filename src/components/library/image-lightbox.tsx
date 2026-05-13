"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Download, Sparkles, Star, Trash2 } from "lucide-react";
import type { LibraryImage } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IMAGE_MODELS } from "@/services/image-generation/models";

/**
 * Resolve a stored `model_id` (e.g. `"openai:gpt-image-1.5"`) to the friendly
 * display name (`"GPT Image 1.5"`). Falls back to the raw id when the model is
 * no longer in the registry — older library rows from removed models should
 * still render gracefully.
 */
function modelDisplayName(modelId: string): string {
  return IMAGE_MODELS.find((m) => m.id === modelId)?.name ?? modelId;
}

/**
 * Human-friendly label for the thinking level the user selected at generation
 * time. The DB stores either `"default"` or `"deep"`; older rows may carry the
 * raw provider value (`minimal` / `low` / `high`). We collapse them all to two
 * UI labels.
 */
function thinkingLabel(level: string): string {
  if (level === "deep" || level === "high") return "Deep";
  return "Default";
}

/**
 * Relative time formatter — short, friendly, no monospace. Used for the
 * `Created` field in the metadata list.
 *
 * Inlined (no date-fns dep) to match the project's existing approach in
 * `src/components/keys/key-table.tsx`.
 */
function relativeTime(iso: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return "";
  const diff = Date.now() - parsed;
  if (diff < 60_000) return "Just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 30) return `${days}d ago`;
  const date = new Date(parsed);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type ImageLightboxProps = {
  image: LibraryImage | null;
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
  // image so a destructive prompt never carries over. Uses the "store prior
  // value in state" pattern (React docs: "Adjusting State Based on a Prop
  // Change") rather than useEffect → setState.
  const [prevImageId, setPrevImageId] = useState<string | null>(
    image?.id ?? null,
  );
  if (image && image.id !== prevImageId) {
    setPrevImageId(image.id);
    setConfirmDelete(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) setConfirmDelete(false);
    onOpenChange(next);
  }

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-[20px] border bg-card p-0",
          "sm:max-w-4xl",
        )}
      >
        <DialogTitle className="sr-only">Image details</DialogTitle>
        <DialogDescription className="sr-only">
          Full metadata and actions for this generated image.
        </DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
          {/* Image — centered on a soft muted backdrop. */}
          <div className="relative flex items-center justify-center bg-muted p-6">
            <div className="relative w-full max-h-[70vh]">
              {/* next/image with `fill` needs a positioned wrapper of a known
                  size. We approximate the image's intrinsic ratio via inline
                  style so it scales to fit the column without distortion. */}
              <div
                className="relative mx-auto w-full overflow-hidden rounded-xl bg-background/40"
                style={{ aspectRatio: getAspectRatio(image.aspect) }}
              >
                <Image
                  src={image.url}
                  alt={image.prompt}
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 60vw, 100vw"
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Metadata + actions. */}
          <div className="flex flex-col border-t md:border-l md:border-t-0">
            <div className="flex-1 space-y-5 overflow-auto p-6">
              <h2 className="font-display text-lg font-medium">
                Image details
              </h2>

              <dl className="space-y-4">
                <MetaRow label="Prompt">
                  <p className="text-pretty">{image.prompt}</p>
                </MetaRow>
                <MetaRow label="Model">{modelDisplayName(image.model)}</MetaRow>
                <MetaRow label="Aspect">{image.aspect}</MetaRow>
                <MetaRow label="Style">{image.style}</MetaRow>
                {image.thinkingLevel ? (
                  <MetaRow label="Thinking">
                    {thinkingLabel(image.thinkingLevel)}
                  </MetaRow>
                ) : null}
                <MetaRow label="Created">
                  {relativeTime(image.createdAt)}
                </MetaRow>
              </dl>
            </div>

            {/* Actions column — outline buttons stacked, ghost destructive
                at the very bottom with inline confirm. */}
            <div className="space-y-2 border-t p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onDownload(image)}
                className="w-full justify-start gap-2"
              >
                <Download aria-hidden="true" className="size-4" />
                Download
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onCopyPrompt(image)}
                className="w-full justify-start gap-2"
              >
                <Copy aria-hidden="true" className="size-4" />
                Copy prompt
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onRegenerate(image)}
                className="w-full justify-start gap-2"
              >
                <Sparkles aria-hidden="true" className="size-4" />
                Regenerate
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onToggleFavorite(image)}
                aria-pressed={image.favorite}
                className={cn(
                  "w-full justify-start gap-2",
                  image.favorite && "border-primary bg-primary/10 text-primary",
                )}
              >
                <Star
                  aria-hidden="true"
                  className={cn("size-4", image.favorite && "fill-current")}
                />
                {image.favorite ? "Favorited" : "Favorite"}
              </Button>

              {confirmDelete ? (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(image)}
                    className="flex-1 gap-2"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Confirm
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete
                </Button>
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
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

/**
 * Same aspect-ratio resolver as the card. Duplicated locally to keep the
 * lightbox self-contained (no shared util needed for two callers).
 */
function getAspectRatio(aspect: string): string {
  const match = /^(\d+):(\d+)$/.exec(aspect);
  if (!match) return "1 / 1";
  return `${match[1]} / ${match[2]}`;
}
