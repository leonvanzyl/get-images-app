"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PromptComposer } from "@/components/generate/prompt-composer";
import { RecentStrip } from "@/components/generate/recent-strip";
import {
  ResultStage,
  type ResultStageState,
} from "@/components/generate/result-stage";
import {
  SettingsPanel,
  type GenerateModel,
} from "@/components/generate/settings-panel";
import {
  MOCK_MODELS,
  picsumUrl,
  type AspectRatio,
  type MockImage,
  type StylePreset,
} from "@/lib/mock-data";

/**
 * Mocked generation latency. Chosen to be long enough to see the film-progress
 * bar and scan-line sweep but short enough to keep clicking through fun.
 */
const GENERATION_LATENCY_MS = 1600;

const HISTORY_LIMIT = 8;
const SESSION_ID = "G-4719";

const DEFAULT_MODEL: GenerateModel = MOCK_MODELS[0];

/**
 * Generate view — `/dashboard`.
 *
 * Two-column layout: prompt + settings + recent strip on the left, the
 * "film plate" result stage on the right. All state is local to the page; we
 * fake the generation by waiting a tick, then prepending a `MockImage` built
 * from the current controls to a session-scoped history list.
 */
export default function DashboardGeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<AspectRatio>("4:5");
  const [style, setStyle] = useState<StylePreset>("Cinematic");
  const [model, setModel] = useState<GenerateModel>(DEFAULT_MODEL);
  const [seed, setSeed] = useState(4719);
  const [state, setState] = useState<ResultStageState>("empty");
  const [result, setResult] = useState<MockImage | null>(null);
  const [history, setHistory] = useState<MockImage[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any in-flight mock generation timer on unmount so we don't try to
  // set state on an unmounted component (e.g. when the user navigates away
  // mid-generation).
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const isGenerating = state === "generating";

  const runGeneration = useCallback(
    (
      currentPrompt: string,
      currentAspect: AspectRatio,
      currentStyle: StylePreset,
      currentModel: GenerateModel,
      currentSeed: number,
    ) => {
      const trimmed = currentPrompt.trim();
      if (trimmed.length === 0) {
        return;
      }

      setState("generating");

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const id = `gen-${Date.now()}`;
        const next: MockImage = {
          id,
          prompt: trimmed,
          model: currentModel.id,
          aspect: currentAspect,
          style: currentStyle,
          seed: currentSeed,
          createdAt: new Date().toISOString(),
          url: picsumUrl(id, currentAspect),
        };

        setResult(next);
        setHistory((previous) => {
          const filtered = previous.filter((entry) => entry.id !== next.id);
          return [next, ...filtered].slice(0, HISTORY_LIMIT);
        });
        setState("result");
        timerRef.current = null;
      }, GENERATION_LATENCY_MS);
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    runGeneration(prompt, aspect, style, model, seed);
  }, [runGeneration, prompt, aspect, style, model, seed]);

  const handleRegenerate = useCallback(() => {
    runGeneration(prompt, aspect, style, model, seed);
  }, [runGeneration, prompt, aspect, style, model, seed]);

  const handleSelectRecent = useCallback((image: MockImage) => {
    // Re-hydrate the controls so a follow-up "Regen" produces a variant of the
    // selected frame instead of whatever happened to be in state.
    setResult(image);
    setPrompt(image.prompt);
    setAspect(image.aspect);
    setStyle(image.style);
    setSeed(image.seed);
    const matchedModel = MOCK_MODELS.find((entry) => entry.id === image.model);
    if (matchedModel) {
      setModel(matchedModel);
    }
    setState("result");
  }, []);

  const handleSave = useCallback(() => {
    toast.success("Saved to library", {
      description: "Available in the Library view shortly.",
    });
  }, []);

  const handleCopyPrompt = useCallback(async () => {
    const value = result?.prompt ?? prompt;
    if (!value.trim()) {
      toast.error("Nothing to copy yet");
      return;
    }
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(value);
        toast.success("Prompt copied");
      } else {
        toast.error("Clipboard unavailable");
      }
    } catch {
      toast.error("Couldn't copy prompt");
    }
  }, [prompt, result?.prompt]);

  return (
    <div
      className="flex flex-col gap-8 p-6 sm:p-8 animate-fade-up"
      style={{ animationFillMode: "both" }}
    >
      {/* Frame-numbered eyebrow */}
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)] animate-cursor-blink"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
            01 — Generate
          </p>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Compose · render · refine
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Session ·{" "}
          <span className="text-foreground/80">#{SESSION_ID}</span>
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* LEFT — prompt + settings + recent */}
        <div className="flex min-w-0 flex-col gap-6">
          <PromptComposer
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            disabled={isGenerating}
          />
          <SettingsPanel
            aspect={aspect}
            setAspect={setAspect}
            style={style}
            setStyle={setStyle}
            model={model}
            setModel={setModel}
            seed={seed}
            setSeed={setSeed}
            disabled={isGenerating}
          />
          <RecentStrip
            items={history}
            current={result}
            onSelect={handleSelectRecent}
          />
        </div>

        {/* RIGHT — result stage */}
        <div className="min-w-0">
          <div className="lg:sticky lg:top-20">
            <ResultStage
              state={state}
              result={result}
              prompt={prompt}
              aspect={aspect}
              style={style}
              model={{ id: model.id, name: model.name }}
              seed={seed}
              onSave={handleSave}
              onRegenerate={handleRegenerate}
              onCopyPrompt={handleCopyPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
