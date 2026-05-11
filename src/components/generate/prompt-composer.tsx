"use client";

import { useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_PROMPTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const IDEA_CHIPS = EXAMPLE_PROMPTS.slice(0, 6);
const MAX_CHARS = 2000;

type PromptComposerProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

/**
 * Cinematic prompt composer. The textarea is the focal surface; idea chips
 * below seed the prompt with curated examples, and the GENERATE button morphs
 * into a film-progress bar while a generation is in flight.
 */
export function PromptComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: PromptComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [focused, setFocused] = useState(false);

  const submit = () => {
    if (disabled) return;
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit();
  };

  const pickRandomExample = () => {
    if (disabled || EXAMPLE_PROMPTS.length === 0) return;
    const index = Math.floor(Math.random() * EXAMPLE_PROMPTS.length);
    const next = EXAMPLE_PROMPTS[index] ?? EXAMPLE_PROMPTS[0];
    if (next) {
      onChange(next);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key === "Enter" &&
      !disabled
    ) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <section
      aria-labelledby="prompt-label"
      className="flex flex-col gap-4"
    >
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.9_0.22_130/0.6)]"
          />
          <p
            id="prompt-label"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            Prompt — describe the frame
          </p>
        </div>
        <p
          aria-live="polite"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums"
        >
          {String(value.length).padStart(3, "0")} chars
        </p>
      </div>

      <div
        className={cn(
          "relative border border-border bg-card transition-colors",
          focused && "border-primary/60",
        )}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            onChange(
              next.length > MAX_CHARS ? next.slice(0, MAX_CHARS) : next,
            );
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={MAX_CHARS}
          placeholder="A weathered lighthouse keeper writing in a logbook, kerosene lamp glow…"
          aria-label="Prompt"
          className={cn(
            "min-h-[200px] w-full resize-y rounded-none border-0 bg-transparent px-6 py-5",
            "text-lg leading-relaxed shadow-none",
            "focus-visible:border-0 focus-visible:ring-0",
            "placeholder:text-muted-foreground/60",
          )}
        />

        {focused && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 right-5 inline-block h-4 w-[2px] bg-primary animate-cursor-blink"
          />
        )}

        {/* Corner ticks — quiet cinematic chrome. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -left-1 font-mono text-xs text-primary/70 select-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -right-1 font-mono text-xs text-primary/70 select-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -left-1 font-mono text-xs text-primary/70 select-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -right-1 font-mono text-xs text-primary/70 select-none"
        >
          +
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Idea chips"
        >
          {IDEA_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={disabled}
              onClick={() => onChange(chip)}
              className={cn(
                "max-w-[28ch] truncate border border-border bg-background/40 px-2.5 py-1",
                "font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
                "transition-colors hover:border-primary/50 hover:text-foreground",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
              title={chip}
            >
              {chip}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={pickRandomExample}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1",
            "font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
            "transition-colors hover:text-foreground",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <Shuffle aria-hidden="true" className="size-3" />
          Shuffle
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          {disabled ? (
            <span>● Rendering — please wait</span>
          ) : (
            <span>↩ ⌘ + ENTER to generate</span>
          )}
        </p>

        {disabled ? (
          <div
            className={cn(
              "film-progress relative inline-flex h-10 items-center justify-center",
              "min-w-[180px] rounded-none border border-primary/60 bg-primary/10 px-6",
              "font-mono text-xs uppercase tracking-[0.22em] text-primary",
            )}
            role="status"
            aria-live="polite"
          >
            <span className="relative z-10 bg-card px-2">Generating…</span>
          </div>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={value.trim().length === 0}
            className={cn(
              "glow-lime rounded-none px-7 font-mono text-xs uppercase tracking-[0.22em]",
              "h-10",
            )}
          >
            Generate →
          </Button>
        )}
      </div>
    </section>
  );
}
