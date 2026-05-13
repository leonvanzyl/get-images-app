"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WORKS_WITH = [
  "Claude",
  "Cursor",
  "VS Code",
  "OpenAI",
  "Gemini",
] as const;

type ClientId = "claude-desktop" | "cursor" | "claude-code";

const CLIENT_TABS: Array<{
  id: ClientId;
  label: string;
  filename: string;
  config: string;
}> = [
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    filename: "claude_desktop_config.json",
    config: `{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://mcp.get-images.dev/mcp",
      "headers": {
        "Authorization": "Bearer gi_live_••••••••"
      }
    }
  }
}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    filename: "~/.cursor/mcp.json",
    config: `{
  "mcpServers": {
    "get-images": {
      "url": "https://mcp.get-images.dev/mcp",
      "headers": {
        "Authorization": "Bearer gi_live_••••••••"
      }
    }
  }
}`,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    filename: "terminal",
    config: `claude mcp add --transport http get-images \\
  https://mcp.get-images.dev/mcp \\
  --header "Authorization: Bearer gi_live_••••••••"`,
  },
];

export function Hero() {
  const [activeTab, setActiveTab] = useState<ClientId>("claude-desktop");
  const [copied, setCopied] = useState(false);

  const activeConfig =
    CLIENT_TABS.find((tab) => tab.id === activeTab) ?? CLIENT_TABS[0]!;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeConfig.config);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <section aria-labelledby="hero-heading" className="hero-glow">
      <div className="container mx-auto max-w-6xl px-6 pt-20 pb-12 md:pt-28 md:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* LEFT — copy + CTAs */}
          <div className="animate-fade-up">
            <h1
              id="hero-heading"
              className="font-display text-5xl font-medium tracking-tight text-balance md:text-6xl lg:text-7xl"
            >
              Agents shouldn&apos;t
              <br />
              <span className="italic">need stock photos.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Drop Get Images into Claude, Cursor, or any MCP-aware agent.
              Your agent gains a tool to generate exactly the image it
              needs — no SDK, no glue code.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Get a key
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="#live-demo">Watch the demo</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-xs text-muted-foreground">Works with</span>
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {WORKS_WITH.map((name) => (
                  <li
                    key={name}
                    className="text-sm text-muted-foreground/80"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT — MCP config card */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: "150ms", animationFillMode: "both" }}
          >
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              {/* Tab strip */}
              <div
                role="tablist"
                aria-label="MCP client configuration"
                className="flex items-center gap-1 border-b bg-secondary/50 px-2 pt-2"
              >
                {CLIENT_TABS.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "rounded-t-[8px] px-3 py-2 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-card text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Filename row + copy button */}
              <div className="flex items-center justify-between border-b bg-card px-4 py-2">
                <p className="font-mono text-xs text-muted-foreground">
                  {activeConfig.filename}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Copy config to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Code block */}
              <pre className="m-0 max-h-[320px] overflow-auto bg-card px-5 py-4 font-mono text-[13px] leading-relaxed">
                <code className="text-foreground/90">{activeConfig.config}</code>
              </pre>

              {/* Helper footer */}
              <div className="border-t bg-secondary/30 px-4 py-2.5 text-xs text-muted-foreground">
                Paste it, restart your agent, and you&apos;re wired in.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
