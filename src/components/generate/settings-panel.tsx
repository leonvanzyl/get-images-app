"use client";

import { Dices } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ASPECT_RATIOS,
  STYLE_PRESETS,
  aspectDimensions,
  type AspectRatio,
  type StylePreset,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { ImageModelDefinition } from "@/services/image-generation";

export type GenerateModel = ImageModelDefinition;

type SettingsPanelProps = {
  aspect: AspectRatio;
  setAspect: (next: AspectRatio) => void;
  style: StylePreset;
  setStyle: (next: StylePreset) => void;
  model: GenerateModel;
  setModel: (next: GenerateModel) => void;
  seed: number;
  setSeed: (next: number) => void;
  disabled?: boolean;
  models: ImageModelDefinition[];
};

const LABEL_CLASS =
  "font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground";

/**
 * Bordered panel of render-time controls. Aspect & style use the same mono
 * chip pattern; the model picker is a shadcn Select; seed is a numeric input
 * with a dice randomizer. All controls share the same `disabled` flow so the
 * panel reads as a single unit while a generation is in flight.
 */
export function SettingsPanel({
  aspect,
  setAspect,
  style,
  setStyle,
  model,
  setModel,
  seed,
  setSeed,
  disabled = false,
  models,
}: SettingsPanelProps) {
  const handleModelChange = (id: string) => {
    const next = models.find((entry) => entry.id === id);
    if (next) {
      setModel(next);
    }
  };

  const handleSeedInput = (raw: string) => {
    if (raw.trim() === "") {
      setSeed(0);
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) {
      const clamped = Math.max(0, Math.min(999_999, parsed));
      setSeed(clamped);
    }
  };

  const randomizeSeed = () => {
    if (disabled) return;
    const next = Math.floor(1 + Math.random() * 99_999);
    setSeed(next);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <section
        aria-label="Generation settings"
        className={cn(
          "border border-border bg-card/60",
          disabled && "opacity-70",
        )}
      >
        {/* Aspect ratio */}
        <fieldset className="flex flex-col gap-3 p-5">
          <legend className={LABEL_CLASS}>Aspect</legend>
          <div className="flex flex-wrap gap-1.5">
            {ASPECT_RATIOS.map((option) => {
              const selected = option === aspect;
              const dims = aspectDimensions(option);
              return (
                <Tooltip key={option}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={disabled}
                      onClick={() => setAspect(option)}
                      className={cn(
                        "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]",
                        "transition-colors",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        selected
                          ? "border-primary text-primary glow-lime"
                          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                      )}
                    >
                      {option}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                      {dims.w} × {dims.h}
                    </span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </fieldset>

        <div aria-hidden="true" className="h-px bg-border" />

        {/* Style preset */}
        <fieldset className="flex flex-col gap-3 p-5">
          <legend className={LABEL_CLASS}>Style preset</legend>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_PRESETS.map((option) => {
              const selected = option === style;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => setStyle(option)}
                  className={cn(
                    "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]",
                    "transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    selected
                      ? "border-primary text-primary glow-lime"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div aria-hidden="true" className="h-px bg-border" />

        {/* Model */}
        <fieldset className="flex flex-col gap-3 p-5">
          <legend className={LABEL_CLASS}>Model</legend>
          <Select
            value={model.id}
            onValueChange={handleModelChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "h-10 w-full rounded-none border-border bg-background/40 font-mono text-xs",
                "uppercase tracking-[0.16em]",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="start"
              position="popper"
              className="rounded-none"
            >
              {Object.entries(
                models.reduce<Record<string, ImageModelDefinition[]>>(
                  (acc, m) => {
                    const key = m.providerId.toUpperCase();
                    (acc[key] ??= []).push(m);
                    return acc;
                  },
                  {},
                ),
              ).map(([provider, group]) => (
                <SelectGroup key={provider}>
                  <SelectLabel className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {provider}
                  </SelectLabel>
                  {group.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className="font-mono text-xs uppercase tracking-[0.14em]"
                    >
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
            {model.description}
          </p>
        </fieldset>

        <div aria-hidden="true" className="h-px bg-border" />

        {/* Seed */}
        <fieldset className="flex flex-col gap-3 p-5">
          <legend className={LABEL_CLASS}>Seed</legend>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={999_999}
              step={1}
              value={Number.isFinite(seed) ? seed : 0}
              onChange={(event) => handleSeedInput(event.target.value)}
              disabled={disabled}
              className={cn(
                "h-10 flex-1 rounded-none border-border bg-background/40",
                "font-mono text-sm tabular-nums tracking-wide",
              )}
              aria-label="Seed"
            />
            <button
              type="button"
              onClick={randomizeSeed}
              disabled={disabled}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 border border-border px-3",
                "font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
                "transition-colors hover:border-foreground/40 hover:text-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              aria-label="Randomize seed"
            >
              <Dices aria-hidden="true" className="size-3.5" />
              Dice
            </button>
          </div>
        </fieldset>
      </section>
    </TooltipProvider>
  );
}
