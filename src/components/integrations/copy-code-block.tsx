"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Lightweight JSON token used by the in-house highlighter below. We avoid
 * pulling in a full syntax-highlighting library — the integration snippets
 * are short, JSON-only, and the visual interest comes from a small handful of
 * token classes (key/string/number/punct) rather than language-perfect parsing.
 */
type JsonToken = {
  type: "key" | "string" | "number" | "boolean" | "punct" | "ws";
  text: string;
};

/**
 * Minimal JSON tokenizer. Reads strings greedily, classifies them as keys when
 * the next non-whitespace char is `:` and as values otherwise. Numbers,
 * booleans, and `null` are recognized as single tokens; everything else
 * (braces, brackets, commas, etc.) falls into the `punct` bucket. Whitespace
 * is preserved as a dedicated token so the `<pre>` layout stays intact.
 */
function tokenizeJson(code: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  const n = code.length;
  let i = 0;

  while (i < n) {
    const c = code.charAt(i);
    if (c === '"') {
      // Walk to the matching unescaped quote, then peek past whitespace to
      // classify the string as a key (`"foo":`) vs a value.
      let end = i + 1;
      while (end < n && code.charAt(end) !== '"') {
        if (code.charAt(end) === "\\" && end + 1 < n) {
          end += 2;
        } else {
          end += 1;
        }
      }
      const text = code.slice(i, end + 1);
      let j = end + 1;
      while (j < n && (code.charAt(j) === " " || code.charAt(j) === "\t")) {
        j += 1;
      }
      tokens.push({
        type: code.charAt(j) === ":" ? "key" : "string",
        text,
      });
      i = end + 1;
      continue;
    }

    if (/[0-9-]/.test(c) && !/[a-zA-Z]/.test(code.charAt(i - 1) || "")) {
      // Leading `-` is treated as part of the number only when it isn't
      // attached to an identifier (which JSON never produces, but keeps the
      // tokenizer well-behaved on stray characters).
      let end = i;
      while (end < n && /[0-9.\-eE+]/.test(code.charAt(end))) {
        end += 1;
      }
      tokens.push({ type: "number", text: code.slice(i, end) });
      i = end;
      continue;
    }

    if (/[a-zA-Z]/.test(c)) {
      let end = i;
      while (end < n && /[a-zA-Z]/.test(code.charAt(end))) {
        end += 1;
      }
      const text = code.slice(i, end);
      tokens.push({
        type:
          text === "true" || text === "false" || text === "null"
            ? "boolean"
            : "punct",
        text,
      });
      i = end;
      continue;
    }

    if (/\s/.test(c)) {
      let end = i;
      while (end < n && /\s/.test(code.charAt(end))) {
        end += 1;
      }
      tokens.push({ type: "ws", text: code.slice(i, end) });
      i = end;
      continue;
    }

    tokens.push({ type: "punct", text: c });
    i += 1;
  }

  return tokens;
}

function tokenClass(type: JsonToken["type"]): string {
  switch (type) {
    case "key":
      // Ice-blue (chart-5) — matches the JSON colorways used on the landing page.
      return "text-[oklch(0.82_0.09_230)]";
    case "string":
      return "text-primary";
    case "number":
    case "boolean":
      return "text-[oklch(0.78_0.16_75)]";
    case "punct":
      return "text-muted-foreground";
    case "ws":
      return "";
  }
}

export interface CopyCodeBlockProps {
  filename: string;
  code: string;
  /**
   * Hint for the syntax highlighter. Today only `json` is implemented; the
   * prop exists so callers can declare intent and we can extend later without
   * a signature change.
   */
  language?: string;
  className?: string;
}

export function CopyCodeBlock({
  filename,
  code,
  className,
}: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Copied to clipboard");
        // Reset the button label after a short window so the user gets a
        // clear "yes it copied" beat without the state sticking around.
        setTimeout(() => setCopied(false), 1500);
      } else {
        toast.error("Clipboard not available");
      }
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const tokens = tokenizeJson(code);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-none border border-border/60 bg-[oklch(0.07_0.008_240)]",
        "shadow-[0_0_0_1px_oklch(0.9_0.22_130/0.04),0_24px_48px_-24px_oklch(0_0_0/0.7)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-[oklch(0.1_0.008_240)] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full bg-[oklch(0.55_0.18_25)]"
          />
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full bg-[oklch(0.7_0.16_75)]"
          />
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full bg-[oklch(0.72_0.14_140)]"
          />
          <span className="ml-2 truncate font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {filename}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${filename} to clipboard`}
          className={cn(
            "shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
            copied
              ? "text-primary"
              : "text-muted-foreground hover:text-primary",
          )}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto bg-transparent p-5 font-mono text-sm leading-relaxed">
        <code className="block whitespace-pre text-foreground/90">
          {tokens.map((token, idx) => (
            <span
              key={`${idx}-${token.type}`}
              className={tokenClass(token.type)}
            >
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
