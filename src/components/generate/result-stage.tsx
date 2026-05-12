"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Bookmark, Copy, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  aspectDimensions,
  type AspectRatio,
  type StylePreset,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type GeneratedImageDisplay = {
  id: string;
  url: string;
  prompt: string;
};

type ResultModel = { id: string; name: string };

export type ResultStageState = "empty" | "generating" | "result";

type ResultStageProps = {
  state: ResultStageState;
  result: GeneratedImageDisplay | null;
  prompt: string;
  aspect: AspectRatio;
  style: StylePreset;
  model: ResultModel;
  seed: number;
  onSave: () => void;
  onRegenerate: () => void;
  onCopyPrompt: () => void;
};

const CORNER_TICK_CLASS =
  "pointer-events-none absolute font-mono text-base text-primary/70 select-none";

function truncate(value: string, max = 60): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

/**
 * Central "film plate" preview area. The aspect ratio is driven by the active
 * `aspect` prop so the plate visually reflects what the user will receive.
 * Three states cover the full generation loop:
 *   - empty:      stand-by microcopy
 *   - generating: a sweep bar moves top-to-bottom over a scan-lined plate
 *   - result:     rendered image with a hover action bar
 */
export function ResultStage({
  state,
  result,
  prompt,
  aspect,
  style,
  model,
  seed,
  onSave,
  onRegenerate,
  onCopyPrompt,
}: ResultStageProps) {
  const dims = aspectDimensions(aspect);
  const aspectRatio = useMemo(() => `${dims.w} / ${dims.h}`, [dims.w, dims.h]);

  const promptForCaption = prompt.trim().length > 0 ? prompt : "—";

  return (
    <section
      aria-label="Result stage"
      className="flex flex-col gap-5"
    >
      {/* Local keyframe — top-to-bottom sweep for the generating state.
          React 19 hoists <style> elements to <head> automatically. */}
      <style>{`
        @keyframes scan-sweep {
          0% { transform: translateY(-110%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(110%); opacity: 0; }
        }
        .scan-sweep-bar {
          animation: scan-sweep 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      <header className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Plate / {state === "result" && result ? result.id : "—"}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]">
          {state === "generating" ? (
            <span className="text-primary">● Rendering</span>
          ) : state === "result" ? (
            <span className="text-primary">● Ready</span>
          ) : (
            <span className="text-muted-foreground">○ Idle</span>
          )}
        </p>
      </header>

      <div className="relative">
        {/* Corner ticks frame the plate. */}
        <span aria-hidden="true" className={cn(CORNER_TICK_CLASS, "-top-3 -left-3")}>
          +
        </span>
        <span aria-hidden="true" className={cn(CORNER_TICK_CLASS, "-top-3 -right-3")}>
          +
        </span>
        <span
          aria-hidden="true"
          className={cn(CORNER_TICK_CLASS, "-bottom-3 -left-3")}
        >
          +
        </span>
        <span
          aria-hidden="true"
          className={cn(CORNER_TICK_CLASS, "-bottom-3 -right-3")}
        >
          +
        </span>

        <div
          className={cn(
            "group/plate relative w-full overflow-hidden border border-border bg-card",
            state !== "result" && "scanlines",
          )}
          style={{ aspectRatio }}
          role="img"
          aria-label={
            state === "result" && result
              ? `Generated image for: ${result.prompt}`
              : state === "generating"
                ? "Generating image"
                : "Standby — no image yet"
          }
        >
          {state === "empty" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <span
                aria-hidden="true"
                className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/60"
              >
                STAND BY
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Your frame will render here
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                {aspect} · {dims.w}×{dims.h}
              </p>
            </div>
          )}

          {state === "generating" && (
            <>
              <div className="absolute inset-0 bg-background/60" />
              <div
                aria-hidden="true"
                className="scan-sweep-bar pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, oklch(0.9 0.22 130 / 0) 5%, oklch(0.9 0.22 130 / 0.18) 45%, oklch(0.9 0.22 130 / 0.55) 50%, oklch(0.9 0.22 130 / 0.18) 55%, transparent 95%, transparent 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-primary/30 bg-background/80 px-4 py-2 backdrop-blur-sm">
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Rendering — {truncate(prompt || "untitled", 60)}
                </p>
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 rounded-full bg-primary animate-cursor-blink"
                />
              </div>
            </>
          )}

          {state === "result" && result && (
            <>
              <Image
                src={result.url}
                alt={result.prompt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover animate-fade-in"
                unoptimized={false}
              />

              {/* Hover action bar */}
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2",
                  "border-t border-primary/40 bg-background/85 px-3 py-2 backdrop-blur-sm",
                  "transition-transform duration-200",
                  "group-hover/plate:translate-y-0 focus-within:translate-y-0",
                )}
              >
                <div className="flex flex-wrap gap-1">
                  <ActionButton onClick={onSave} icon={<Bookmark className="size-3" />}>
                    Save to library
                  </ActionButton>
                  <ActionButton
                    onClick={onRegenerate}
                    icon={<RefreshCcw className="size-3" />}
                  >
                    Regen
                  </ActionButton>
                  <ActionButton
                    onClick={onCopyPrompt}
                    icon={<Copy className="size-3" />}
                  >
                    Copy prompt
                  </ActionButton>
                </div>
                <DownloadAction url={result.url} />
              </div>
            </>
          )}
        </div>
      </div>

      <dl className="grid gap-2 border-t border-border/60 pt-4">
        <div className="flex items-start gap-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground shrink-0 pt-0.5">
            Prompt —
          </dt>
          <dd className="font-mono text-[11px] leading-relaxed text-foreground/90 wrap-break-word">
            {promptForCaption}
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-foreground/80">MODEL · {model.name}</span>
          <span aria-hidden="true" className="text-muted-foreground/40">
            ·
          </span>
          <span>SEED {String(seed).padStart(4, "0")}</span>
          <span aria-hidden="true" className="text-muted-foreground/40">
            ·
          </span>
          <span>{aspect}</span>
          <span aria-hidden="true" className="text-muted-foreground/40">
            ·
          </span>
          <span>{style.toUpperCase()}</span>
        </div>
      </dl>
    </section>
  );
}

function ActionButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border border-border px-2 py-1",
        "font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
        "transition-colors hover:border-primary/60 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function DownloadAction({ url }: { url: string }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={cn(
        "inline-flex items-center gap-1.5 border border-primary/50 px-2 py-1",
        "font-mono text-[10px] uppercase tracking-[0.18em] text-primary",
        "transition-colors hover:bg-primary/10",
      )}
    >
      <Download aria-hidden="true" className="size-3" />
      Download
    </button>
  );
}
