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
  type AspectRatio,
  type StylePreset,
} from "@/lib/mock-data";
import {
  generateImageAction,
  getAvailableModelsAction,
} from "./actions";

const HISTORY_LIMIT = 8;
const SESSION_ID = "G-4719";

type RecentImage = {
  id: string;
  url: string;
  prompt: string;
  aspect: string;
  style: string;
  seed: number;
  model: string;
};

export default function DashboardGeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<AspectRatio>("4:5");
  const [style, setStyle] = useState<StylePreset>("Cinematic");
  const [models, setModels] = useState<GenerateModel[]>([]);
  const [model, setModel] = useState<GenerateModel | null>(null);
  const [seed, setSeed] = useState(4719);
  const [state, setState] = useState<ResultStageState>("empty");
  const [result, setResult] = useState<RecentImage | null>(null);
  const [history, setHistory] = useState<RecentImage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getAvailableModelsAction().then((available) => {
      setModels(available);
      if (available.length > 0 && !model) {
        setModel(available[0] ?? null);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = abortRef.current;
    return () => {
      controller?.abort();
    };
  }, []);

  const isGenerating = state === "generating";

  const runGeneration = useCallback(
    async (
      currentPrompt: string,
      currentAspect: AspectRatio,
      currentStyle: StylePreset,
      currentModel: GenerateModel | null,
      currentSeed: number,
    ) => {
      const trimmed = currentPrompt.trim();
      if (trimmed.length === 0 || !currentModel) return;

      setState("generating");

      const actionResult = await generateImageAction({
        prompt: trimmed,
        modelId: currentModel.id,
        aspectRatio: currentAspect,
        style: currentStyle,
        seed: currentSeed,
      });

      if (!actionResult.success) {
        setState(result ? "result" : "empty");
        toast.error("Generation failed", { description: actionResult.error });
        return;
      }

      const img = actionResult.data.image;
      const next: RecentImage = {
        id: img.id,
        url: img.url,
        prompt: img.prompt,
        aspect: img.aspectRatio,
        style: img.style ?? currentStyle,
        seed: img.seed ?? currentSeed,
        model: img.modelId,
      };

      setResult(next);
      setHistory((previous) => {
        const filtered = previous.filter((entry) => entry.id !== next.id);
        return [next, ...filtered].slice(0, HISTORY_LIMIT);
      });
      setState("result");
    },
    [result],
  );

  const handleSubmit = useCallback(() => {
    runGeneration(prompt, aspect, style, model, seed);
  }, [runGeneration, prompt, aspect, style, model, seed]);

  const handleRegenerate = useCallback(() => {
    runGeneration(prompt, aspect, style, model, seed);
  }, [runGeneration, prompt, aspect, style, model, seed]);

  const handleSelectRecent = useCallback(
    (image: { id: string; url: string; prompt: string; aspect: string }) => {
      const full = history.find((h) => h.id === image.id);
      if (!full) return;
      setResult(full);
      setPrompt(full.prompt);
      setAspect(full.aspect as AspectRatio);
      setStyle(full.style as StylePreset);
      setSeed(full.seed);
      const matchedModel = models.find((entry) => entry.id === full.model);
      if (matchedModel) setModel(matchedModel);
      setState("result");
    },
    [history, models],
  );

  const handleSave = useCallback(() => {
    toast.success("Image saved", {
      description: "All generated images are automatically persisted.",
    });
  }, []);

  const handleCopyPrompt = useCallback(async () => {
    const value = result?.prompt ?? prompt;
    if (!value.trim()) {
      toast.error("Nothing to copy yet");
      return;
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        toast.success("Prompt copied");
      } else {
        toast.error("Clipboard unavailable");
      }
    } catch {
      toast.error("Couldn't copy prompt");
    }
  }, [prompt, result?.prompt]);

  if (models.length === 0) {
    return (
      <div className="flex flex-col gap-8 p-6 sm:p-8 animate-fade-up" style={{ animationFillMode: "both" }}>
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)] animate-cursor-blink" />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">01 — Generate</p>
          </div>
        </header>
        <div className="border border-dashed border-border/60 bg-card/40 p-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— no models available —</p>
          <p className="mt-4 font-mono text-sm uppercase tracking-[0.18em] text-foreground">Configure API Keys</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Set OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in your environment to enable image generation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8 animate-fade-up" style={{ animationFillMode: "both" }}>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)] animate-cursor-blink" />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">01 — Generate</p>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Compose · render · refine</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Session · <span className="text-foreground/80">#{SESSION_ID}</span>
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <PromptComposer value={prompt} onChange={setPrompt} onSubmit={handleSubmit} disabled={isGenerating} />
          <SettingsPanel
            aspect={aspect}
            setAspect={setAspect}
            style={style}
            setStyle={setStyle}
            model={model ?? models[0]!}
            setModel={setModel}
            seed={seed}
            setSeed={setSeed}
            disabled={isGenerating}
            models={models}
          />
          <RecentStrip items={history} current={result} onSelect={handleSelectRecent} />
        </div>

        <div className="min-w-0">
          <div className="lg:sticky lg:top-20">
            <ResultStage
              state={state}
              result={result}
              prompt={prompt}
              aspect={aspect}
              style={style}
              model={{ id: model?.id ?? "", name: model?.name ?? "" }}
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
