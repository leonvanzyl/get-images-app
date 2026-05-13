"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CopyCodeBlockProps {
  code: string;
  /**
   * Optional filename label rendered above the code block. We keep it as a
   * caller-provided string so MCP install recipes can hint at where to paste
   * the snippet (e.g. `claude_desktop_config.json`).
   */
  filename?: string;
  /**
   * Hint for syntax highlighting. Today we render plain code only — the prop
   * exists so callers can declare intent without a signature change later.
   */
  language?: string;
  className?: string;
}

/**
 * Plain rounded code block with a single copy button.
 *
 * Intentionally minimal: no syntax highlighting, no traffic-light chrome,
 * no fake terminal frame. The snippets are short JSON configs and the
 * visual interest belongs to the surrounding page, not the code panel.
 */
export function CopyCodeBlock({
  code,
  filename,
  className,
}: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
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
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-secondary",
        className,
      )}
    >
      {filename && (
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">
            {filename}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label={`Copy ${filename} to clipboard`}
            className="h-7 gap-1.5 px-2 text-xs"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}

      {!filename && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="absolute top-2 right-2 h-7 gap-1.5 px-2 text-xs"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      )}

      <pre className="m-0 overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground">
        <code className="block whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
