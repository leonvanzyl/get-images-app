"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Bookmark, Copy, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AspectRatio,
  ThinkingLevel,
} from "@/services/image-generation";
import type { StyleOption } from "./settings-panel";

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
  style: StyleOption;
  model: ResultModel;
  thinkingLevel: ThinkingLevel;
  /** True only when the active model supports thinking — drives metadata visibility. */
  thinkingSupported: boolean;
  onSave: () => void;
  onRegenerate: () => void;
  onCopyPrompt: () => void;
};

const TRUNCATE_LENGTH = 140;

/**
 * Convert an AspectRatio string like "16:9" into a CSS `aspect-ratio` value.
 * Using slashes works in modern browsers and avoids hard-coding pixel dims.
 */
function aspectToCss(aspect: string): string {
  return aspect.replace(":", " / ");
}

/**
 * Center stage for generation output. Three states:
 *  - empty:      friendly placeholder mocked to the selected aspect ratio
 *  - generating: same shape with a soft pulse and a status line below
 *  - result:     the actual image with a hover toolbar in the corner
 *
 * Metadata sits beneath the card as quiet supporting text.
 */
export function ResultStage({
  state,
  result,
  prompt,
  aspect,
  style,
  model,
  thinkingLevel,
  thinkingSupported,
  onSave,
  onRegenerate,
  onCopyPrompt,
}: ResultStageProps) {
  const aspectRatio = useMemo(() => aspectToCss(aspect), [aspect]);
  const [promptExpanded, setPromptExpanded] = useState(false);

  // Prefer the persisted result's prompt for metadata so the caption stays
  // stable while the user edits the textarea above.
  const captionPrompt =
    state === "result" && result?.prompt ? result.prompt : prompt;
  const isLongPrompt = captionPrompt.length > TRUNCATE_LENGTH;
  const displayedPrompt =
    isLongPrompt && !promptExpanded
      ? `${captionPrompt.slice(0, TRUNCATE_LENGTH)}…`
      : captionPrompt;

  return (
    <section aria-label="Result" className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div
          className="group/result relative w-full"
          style={{ aspectRatio }}
          role="img"
          aria-label={
            state === "result" && result
              ? `Generated image for: ${result.prompt}`
              : state === "generating"
                ? "Generating image"
                : "Your image will appear here"
          }
        >
          {state === "empty" && (
            <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 text-center">
              <p className="font-display text-xl font-medium">
                Your image will appear here.
              </p>
              <p className="text-sm text-muted-foreground">
                Describe something and hit generate.
              </p>
            </div>
          )}

          {state === "generating" && <GeneratingAurora />}

          {state === "result" && result && (
            <>
              <Image
                src={result.url}
                alt={result.prompt}
                fill
                unoptimized
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover animate-fade-in"
              />

              {/* Floating action bar — appears on hover or keyboard focus. */}
              <div
                className={cn(
                  "absolute bottom-3 right-3 flex flex-wrap items-center gap-1.5",
                  "opacity-0 transition-opacity duration-200",
                  "group-hover/result:opacity-100 focus-within:opacity-100",
                )}
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onCopyPrompt}
                >
                  <Copy aria-hidden="true" className="size-4" />
                  Copy prompt
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onRegenerate}
                >
                  <RefreshCcw aria-hidden="true" className="size-4" />
                  Regenerate
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onSave}
                >
                  <Bookmark aria-hidden="true" className="size-4" />
                  Save
                </Button>
                <DownloadButton url={result.url} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Metadata row — quiet text below the card. */}
      {(state === "result" || captionPrompt.trim().length > 0) && (
        <dl className="space-y-1.5 text-xs text-muted-foreground">
          {captionPrompt.trim().length > 0 && (
            <div className="flex flex-col gap-1">
              <dt className="sr-only">Prompt</dt>
              <dd className="text-foreground/80">
                <span className="whitespace-pre-wrap">{displayedPrompt}</span>
                {isLongPrompt && (
                  <button
                    type="button"
                    onClick={() => setPromptExpanded((value) => !value)}
                    className="ml-1.5 text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                  >
                    {promptExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </dd>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{model.name || "—"}</span>
            <span aria-hidden="true">·</span>
            <span>{aspect}</span>
            <span aria-hidden="true">·</span>
            <span>{style}</span>
            {thinkingSupported && thinkingLevel === "deep" && (
              <>
                <span aria-hidden="true">·</span>
                <span>Thinking: deep</span>
              </>
            )}
          </div>
        </dl>
      )}
    </section>
  );
}

/**
 * Generating-state visual — three drifting coral/amber/plum orbs over a
 * dark warm base, with a soft diagonal sheen sweeping across and a status
 * line at the bottom. Keyframes live in globals.css.
 */
function GeneratingAurora() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-3 overflow-hidden rounded-xl bg-[oklch(0.2_0.012_60)]"
    >
      {/* Drifting orbs — three offset radial gradients drift on different
          phases so the composition feels alive without being busy. */}
      <div
        className="absolute -inset-[20%] opacity-90 mix-blend-screen"
        style={{
          background:
            "radial-gradient(closest-side at 30% 35%, oklch(0.75 0.2 35 / 0.85) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "orb-drift-a 11s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -inset-[20%] opacity-85 mix-blend-screen"
        style={{
          background:
            "radial-gradient(closest-side at 70% 60%, oklch(0.82 0.16 75 / 0.75) 0%, transparent 70%)",
          filter: "blur(45px)",
          animation: "orb-drift-b 13s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -inset-[20%] opacity-80 mix-blend-screen"
        style={{
          background:
            "radial-gradient(closest-side at 55% 40%, oklch(0.7 0.18 340 / 0.7) 0%, transparent 70%)",
          filter: "blur(55px)",
          animation: "orb-drift-c 17s ease-in-out infinite",
        }}
      />

      {/* Soft diagonal sheen — a wide light strip sweeps across every few
          seconds, the way a render preview "wipes" into existence. */}
      <div
        className="absolute -inset-y-1/2 -inset-x-1/4 mix-blend-overlay"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, oklch(1 0 0 / 0.22) 50%, transparent 65%)",
          animation: "aurora-sweep 3.6s ease-in-out infinite",
        }}
      />

      {/* Subtle vignette to ground the orbs against the edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, oklch(0 0 0 / 0.35) 100%)",
        }}
      />

      {/* Status caption */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-6">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-white/85"
          style={{ animation: "status-dot 1.4s ease-in-out infinite" }}
        />
        <p className="text-sm font-medium text-white/90">
          Cooking your image…
        </p>
      </div>
    </div>
  );
}

function DownloadButton({ url }: { url: string }) {
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
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleDownload}
    >
      <Download aria-hidden="true" className="size-4" />
      Download
    </Button>
  );
}
