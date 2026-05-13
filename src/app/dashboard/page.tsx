"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
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
  type PricingEntry,
  type StyleOption,
} from "@/components/generate/settings-panel";
import { Button } from "@/components/ui/button";
import type {
  AspectRatio,
  ThinkingLevel,
} from "@/services/image-generation";
import {
  generateImageAction,
  getAvailableModelsAction,
  getModelPricingAction,
} from "./actions";

const HISTORY_LIMIT = 8;
const DEFAULT_ASPECT: AspectRatio = "1:1";
const DEFAULT_STYLE: StyleOption = "Natural";
const DEFAULT_THINKING: ThinkingLevel = "default";

type RecentImage = {
  id: string;
  url: string;
  prompt: string;
  aspect: string;
  style: string;
  thinkingLevel: ThinkingLevel;
  model: string;
};

export default function DashboardGeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<AspectRatio>(DEFAULT_ASPECT);
  const [style, setStyle] = useState<StyleOption>(DEFAULT_STYLE);
  const [models, setModels] = useState<GenerateModel[]>([]);
  const [model, setModel] = useState<GenerateModel | null>(null);
  const [thinkingLevel, setThinkingLevel] =
    useState<ThinkingLevel>(DEFAULT_THINKING);
  const [pricing, setPricing] = useState<Record<string, PricingEntry>>({});
  const [state, setState] = useState<ResultStageState>("empty");
  const [result, setResult] = useState<RecentImage | null>(null);
  const [history, setHistory] = useState<RecentImage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch the list of configured models once. If a model isn't already
  // selected, default to the first one returned.
  useEffect(() => {
    getAvailableModelsAction().then((available) => {
      setModels(available);
      setModel((current) => current ?? available[0] ?? null);
    });
  }, []);

  // Fetch pricing and build a lookup map keyed by modelId so we can resolve
  // the credit cost (and deep-thinking surcharge) per selection.
  useEffect(() => {
    getModelPricingAction().then((rows) => {
      const map: Record<string, PricingEntry> = {};
      for (const row of rows) {
        map[row.modelId] = {
          creditCost: row.creditCost,
          thinkingHighCreditCost: row.thinkingHighCreditCost,
        };
      }
      setPricing(map);
    });
  }, []);

  // Tear down any in-flight controller on unmount.
  useEffect(() => {
    const controller = abortRef.current;
    return () => {
      controller?.abort();
    };
  }, []);

  // Switching models constrains the aspect-ratio set and may remove thinking
  // support — snap dependent state at the change site rather than via effect.
  const selectModel = useCallback((next: GenerateModel) => {
    setModel(next);
    setAspect((current) =>
      next.aspectRatios.includes(current)
        ? current
        : (next.aspectRatios[0] ?? DEFAULT_ASPECT),
    );
    if (!next.thinking) {
      setThinkingLevel("default");
    }
  }, []);

  const isGenerating = state === "generating";

  // Resolve the credit cost for the currently-selected model + thinking level.
  // Deep thinking uses the surcharge column when available; otherwise we fall
  // back to the base credit cost.
  const currentCost = useMemo<number | null>(() => {
    if (!model) return null;
    const entry = pricing[model.id];
    if (!entry) return null;
    if (
      model.thinking &&
      thinkingLevel === "deep" &&
      entry.thinkingHighCreditCost != null
    ) {
      return entry.thinkingHighCreditCost;
    }
    return entry.creditCost;
  }, [model, pricing, thinkingLevel]);

  const runGeneration = useCallback(
    async (
      currentPrompt: string,
      currentAspect: AspectRatio,
      currentStyle: StyleOption,
      currentModel: GenerateModel | null,
      currentThinking: ThinkingLevel,
    ) => {
      const trimmed = currentPrompt.trim();
      if (trimmed.length === 0 || !currentModel) return;

      setState("generating");

      const actionResult = await generateImageAction({
        prompt: trimmed,
        modelId: currentModel.id,
        aspectRatio: currentAspect,
        style: currentStyle,
        // Only send thinkingLevel when the model supports it — keeps the
        // server schema happy for non-thinking models.
        ...(currentModel.thinking ? { thinkingLevel: currentThinking } : {}),
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
        thinkingLevel: img.thinkingLevel ?? currentThinking,
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
    runGeneration(prompt, aspect, style, model, thinkingLevel);
  }, [runGeneration, prompt, aspect, style, model, thinkingLevel]);

  const handleRegenerate = useCallback(() => {
    runGeneration(prompt, aspect, style, model, thinkingLevel);
  }, [runGeneration, prompt, aspect, style, model, thinkingLevel]);

  const handleSelectRecent = useCallback(
    (image: { id: string }) => {
      const full = history.find((entry) => entry.id === image.id);
      if (!full) return;
      setResult(full);
      setPrompt(full.prompt);
      // Recent images come back with the provider's reported aspect ratio; cast
      // to the union since the type is widened to string in storage.
      setAspect(full.aspect as AspectRatio);
      setStyle(full.style as StyleOption);
      const matchedModel = models.find((entry) => entry.id === full.model);
      if (matchedModel) {
        selectModel(matchedModel);
        if (matchedModel.thinking) {
          setThinkingLevel(full.thinkingLevel);
        }
      }
      setState("result");
    },
    [history, models, selectModel],
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

  const canGenerate =
    !isGenerating && prompt.trim().length > 0 && model !== null;

  // No models configured — show a friendly empty state.
  if (models.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-8 py-10 md:px-12 md:py-12">
        <header className="mb-8 space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            Make something
          </h1>
          <p className="text-muted-foreground">
            Describe what you want. Pick a model. Hit generate.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
          <p className="font-display text-xl font-medium">
            No models available
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Set <span className="font-mono text-xs">OPENAI_API_KEY</span> or{" "}
            <span className="font-mono text-xs">
              GOOGLE_GENERATIVE_AI_API_KEY
            </span>{" "}
            in your environment to enable image generation.
          </p>
        </div>
      </div>
    );
  }

  // Once models are loaded we always have at least one, so `model` is set
  // synchronously in the effect above. Narrow with a guard for safety.
  const activeModel = model ?? models[0]!;

  return (
    <div
      className="mx-auto w-full max-w-6xl px-6 py-10 animate-fade-up md:px-10 md:py-12"
      style={{ animationFillMode: "both" }}
    >
      <header className="mb-10 space-y-2">
        <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
          Make something
        </h1>
        <p className="text-muted-foreground">
          Describe what you want. Pick a model. Hit generate.
        </p>
      </header>

      {/* Two-column working area: prompt + settings left, result right.
          Stacks vertically below lg. */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-8">
          <PromptComposer
            value={prompt}
            onChange={setPrompt}
            disabled={isGenerating}
          />

          <SettingsPanel
            aspect={aspect}
            setAspect={setAspect}
            style={style}
            setStyle={setStyle}
            model={activeModel}
            setModel={selectModel}
            thinkingLevel={thinkingLevel}
            setThinkingLevel={setThinkingLevel}
            disabled={isGenerating}
            models={models}
            pricing={pricing}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="button"
              size="lg"
              className="gap-2"
              onClick={handleSubmit}
              disabled={!canGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  Generating…
                </>
              ) : (
                <>
                  Generate
                  <ArrowRight aria-hidden="true" className="size-4" />
                </>
              )}
            </Button>
            {currentCost != null && (
              <p className="text-sm text-muted-foreground">
                <span className="font-mono">{currentCost}</span> credits
              </p>
            )}
          </div>
        </div>

        <ResultStage
          state={state}
          result={result}
          prompt={prompt}
          aspect={aspect}
          style={style}
          model={{ id: activeModel.id, name: activeModel.name }}
          thinkingLevel={thinkingLevel}
          thinkingSupported={Boolean(activeModel.thinking)}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          onCopyPrompt={handleCopyPrompt}
        />
      </div>

      {/* Recent — full width below both columns */}
      <div className="mt-10">
        <RecentStrip
          items={history}
          current={result}
          onSelect={handleSelectRecent}
        />
      </div>
    </div>
  );
}
