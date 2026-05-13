"use client";

import { useRef } from "react";
import { Shuffle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_PROMPTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Open Studio: a small, curated set of starter chips. The full list lives in
// mock-data; we only show four here to keep the composer breathing room.
const EXAMPLE_CHIPS = EXAMPLE_PROMPTS.slice(0, 4);
const MAX_CHARS = 2000;

type PromptComposerProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

/**
 * Soft, focused prompt input. The textarea sits inside a rounded card; below
 * a hairline divider lives a small toolbar (shuffle example, character count).
 * Four example chips sit outside the card so they read as suggestions, not
 * primary actions.
 */
export function PromptComposer({
  value,
  onChange,
  disabled = false,
}: PromptComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const pickRandomExample = () => {
    if (disabled || EXAMPLE_PROMPTS.length === 0) return;
    const index = Math.floor(Math.random() * EXAMPLE_PROMPTS.length);
    const next = EXAMPLE_PROMPTS[index] ?? EXAMPLE_PROMPTS[0];
    if (next) {
      onChange(next);
      textareaRef.current?.focus();
    }
  };

  return (
    <section aria-label="Prompt" className="flex flex-col gap-4">
      <div className="rounded-2xl border bg-card shadow-sm">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next.length > MAX_CHARS ? next.slice(0, MAX_CHARS) : next);
          }}
          disabled={disabled}
          maxLength={MAX_CHARS}
          placeholder="What should we make?"
          aria-label="Prompt"
          className={cn(
            "min-h-[140px] resize-none border-0 bg-transparent p-5",
            "text-base leading-relaxed shadow-none",
            "focus-visible:ring-0",
          )}
        />

        <div
          aria-hidden="true"
          className="mx-5 h-px bg-border"
        />

        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <button
            type="button"
            onClick={pickRandomExample}
            disabled={disabled}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
              "transition-colors hover:text-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Shuffle aria-hidden="true" className="size-3.5" />
            Try one of these
          </button>
          <p
            aria-live="polite"
            className="text-xs text-muted-foreground tabular-nums"
          >
            {value.length} / {MAX_CHARS}
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Example prompts"
      >
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={disabled}
            onClick={() => onChange(chip)}
            className={cn(
              "max-w-[30ch] truncate rounded-full border px-3 py-1.5 text-sm text-muted-foreground",
              "transition-colors hover:border-foreground/30 hover:text-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            title={chip}
          >
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
}
