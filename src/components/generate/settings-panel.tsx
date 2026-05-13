"use client";

import { Info } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type {
  AspectRatio,
  ImageModelDefinition,
  ThinkingLevel,
} from "@/services/image-generation";

export type GenerateModel = ImageModelDefinition;

/**
 * The five sentence-case style presets we expose to the user. The first
 * entry is the default.
 */
export const STYLE_OPTIONS = [
  "Natural",
  "Cinematic",
  "Editorial",
  "Studio",
  "Illustration",
] as const;

export type StyleOption = (typeof STYLE_OPTIONS)[number];

export type PricingEntry = {
  creditCost: number;
  thinkingHighCreditCost: number | null;
};

type SettingsPanelProps = {
  aspect: AspectRatio;
  setAspect: (next: AspectRatio) => void;
  style: StyleOption;
  setStyle: (next: StyleOption) => void;
  model: GenerateModel;
  setModel: (next: GenerateModel) => void;
  thinkingLevel: ThinkingLevel;
  setThinkingLevel: (next: ThinkingLevel) => void;
  disabled?: boolean;
  models: ImageModelDefinition[];
  /** Map of modelId → pricing row. */
  pricing: Record<string, PricingEntry>;
};

const FIELD_LABEL_CLASS = "text-xs text-muted-foreground";

const CHIP_BASE_CLASS =
  "rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const CHIP_SELECTED_CLASS = "border-primary bg-primary/10 text-primary";

const CHIP_UNSELECTED_CLASS =
  "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground";

/**
 * Horizontal row of generation settings. Each control sits in its own column
 * with a sentence-case label above it; the row wraps on small screens.
 */
export function SettingsPanel({
  aspect,
  setAspect,
  style,
  setStyle,
  model,
  setModel,
  thinkingLevel,
  setThinkingLevel,
  disabled = false,
  models,
  pricing,
}: SettingsPanelProps) {
  const handleModelChange = (id: string) => {
    const next = models.find((entry) => entry.id === id);
    if (next) {
      setModel(next);
    }
  };

  // Group models by provider for the dropdown's labeled sections.
  const groupedModels = models.reduce<Record<string, ImageModelDefinition[]>>(
    (acc, entry) => {
      const key = entry.providerId.toUpperCase();
      (acc[key] ??= []).push(entry);
      return acc;
    },
    {},
  );

  return (
    <TooltipProvider delayDuration={200}>
      <section
        aria-label="Generation settings"
        className={cn(
          "flex flex-wrap items-start gap-x-8 gap-y-6",
          disabled && "opacity-70",
        )}
      >
        {/* Model */}
        <div className="flex min-w-[220px] flex-col gap-2">
          <label htmlFor="model-select" className={FIELD_LABEL_CLASS}>
            Model
          </label>
          <Select
            value={model.id}
            onValueChange={handleModelChange}
            disabled={disabled}
          >
            <SelectTrigger
              id="model-select"
              className="h-10 w-full min-w-[220px] rounded-[10px]"
            >
              {/* Explicit children override the portal-displayed ItemText so
                  the trigger stays minimal (just the model name) while the
                  dropdown items can render a richer description + cost. */}
              <SelectValue>{model.name}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start" position="popper">
              {Object.entries(groupedModels).map(([provider, group]) => (
                <SelectGroup key={provider}>
                  <SelectLabel>{provider}</SelectLabel>
                  {group.map((option) => {
                    const cost = pricing[option.id]?.creditCost;
                    return (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className="py-2"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span>{option.name}</span>
                            {cost != null && (
                              <span className="text-xs text-muted-foreground">
                                <span className="font-mono">{cost}</span> credits
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aspect ratio */}
        <div className="flex flex-col gap-2">
          <span className={FIELD_LABEL_CLASS} id="aspect-label">
            Aspect ratio
          </span>
          <div
            className="flex flex-wrap gap-1.5"
            role="radiogroup"
            aria-labelledby="aspect-label"
          >
            {model.aspectRatios.map((option) => {
              const selected = option === aspect;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => setAspect(option)}
                  className={cn(
                    CHIP_BASE_CLASS,
                    selected ? CHIP_SELECTED_CLASS : CHIP_UNSELECTED_CLASS,
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style preset */}
        <div className="flex flex-col gap-2">
          <span className={FIELD_LABEL_CLASS} id="style-label">
            Style
          </span>
          <div
            className="flex flex-wrap gap-1.5"
            role="radiogroup"
            aria-labelledby="style-label"
          >
            {STYLE_OPTIONS.map((option) => {
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
                    CHIP_BASE_CLASS,
                    selected ? CHIP_SELECTED_CLASS : CHIP_UNSELECTED_CLASS,
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thinking — only when the model supports it */}
        {model.thinking && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <span className={FIELD_LABEL_CLASS} id="thinking-label">
                Thinking
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="About thinking levels"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Info aria-hidden="true" className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Deeper thinking gives better results on complex prompts but
                  costs more credits.
                </TooltipContent>
              </Tooltip>
            </div>
            <div
              className="flex flex-wrap gap-1.5"
              role="radiogroup"
              aria-labelledby="thinking-label"
            >
              {(["default", "deep"] as const).map((option) => {
                const selected = option === thinkingLevel;
                const label = option === "default" ? "Default" : "Deep";
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => setThinkingLevel(option)}
                    className={cn(
                      CHIP_BASE_CLASS,
                      selected ? CHIP_SELECTED_CLASS : CHIP_UNSELECTED_CLASS,
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
