"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * The remote MCP server config snippet shown in the hero terminal. Kept as a
 * plain string for clipboard parity — the syntax-highlighted JSX version below
 * must render the same characters.
 */
const CONFIG_JSON = `{
  "mcp": {
    "get-images": {
      "type": "remote",
      "url": "https://mcp.get-images.dev/mcp",
      "headers": {
        "GET_IMAGES_API_KEY": "gi_live_••••••••••••",
        "GET_IMAGES_MODEL": "openai/image-2"
      },
      "enabled": true
    }
  }
}`;

const CLIENT_TABS = [
  { label: "claude_desktop_config.json", active: true },
  { label: "~/.cursor/mcp.json", active: false },
  { label: "claude-code", active: false },
  { label: "Codex", active: false },
] as const;

const FEATURE_PILLS = [
  "REMOTE — NO INSTALL",
  "GET_IMAGES_API_KEY",
  "GET_IMAGES_MODEL",
] as const;

const WORKS_WITH = [
  "Claude Code",
  "Claude Desktop",
  "Cursor",
  "Codex",
  "ChatGPT",
] as const;

/** Shown in the hero so visitors know backends are swappable per request. */
const IMAGE_BACKENDS = [
  { vendor: "OpenAI", slug: "Image 2" },
  { vendor: "Google", slug: "Nanobanana Pro" },
] as const;

function ConfigJson() {
  return (
    <pre className="m-0 overflow-x-auto bg-transparent px-5 py-4 font-mono text-[13px] leading-relaxed">
      <code className="block whitespace-pre text-foreground/90">
        <span className="text-muted-foreground">{"{"}</span>
        {"\n  "}
        <span className="text-sky-300">&quot;mcp&quot;</span>
        <span className="text-muted-foreground">: {"{"}</span>
        {"\n    "}
        <span className="text-sky-300">&quot;get-images&quot;</span>
        <span className="text-muted-foreground">: {"{"}</span>
        {"\n      "}
        <span className="text-sky-300">&quot;type&quot;</span>
        <span className="text-muted-foreground">: </span>
        <span className="text-primary">&quot;remote&quot;</span>
        <span className="text-muted-foreground">,</span>
        {"\n      "}
        <span className="text-sky-300">&quot;url&quot;</span>
        <span className="text-muted-foreground">: </span>
        <span className="text-primary">
          &quot;https://mcp.get-images.dev/mcp&quot;
        </span>
        <span className="text-muted-foreground">,</span>
        {"\n      "}
        <span className="text-sky-300">&quot;headers&quot;</span>
        <span className="text-muted-foreground">: {"{"}</span>
        {"\n        "}
        <span className="text-sky-300">&quot;GET_IMAGES_API_KEY&quot;</span>
        <span className="text-muted-foreground">: </span>
        <span className="text-primary">
          &quot;gi_live_••••••••••••&quot;
        </span>
        <span className="text-muted-foreground">,</span>
        {"\n        "}
        <span className="text-sky-300">&quot;GET_IMAGES_MODEL&quot;</span>
        <span className="text-muted-foreground">: </span>
        <span className="text-primary">&quot;openai/image-2&quot;</span>
        {"\n      "}
        <span className="text-muted-foreground">{"}"}</span>
        <span className="text-muted-foreground">,</span>
        {"\n      "}
        <span className="text-sky-300">&quot;enabled&quot;</span>
        <span className="text-muted-foreground">: </span>
        <span className="text-amber-300">true</span>
        {"\n    "}
        <span className="text-muted-foreground">{"}"}</span>
        {"\n  "}
        <span className="text-muted-foreground">{"}"}</span>
        {"\n"}
        <span className="text-muted-foreground">{"}"}</span>
      </code>
    </pre>
  );
}

export function Hero() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(CONFIG_JSON);
        setCopied(true);
        toast.success("Copied Get Images MCP config");
        setTimeout(() => setCopied(false), 1500);
      } else {
        toast.error("Clipboard not available");
      }
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <section
      id="manifesto"
      aria-labelledby="hero-heading"
      className="relative scanlines border-b border-border/60"
    >
      <div className="container mx-auto grid w-full min-h-[calc(100vh-3.5rem)] grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-16">
        {/* LEFT — copy column */}
        <div className="flex flex-col gap-8 lg:col-span-7 lg:justify-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block size-1.5 rounded-full bg-primary animate-cursor-blink shadow-[0_0_8px_oklch(0.9_0.22_130/0.7)]"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              01 — INTEGRATION &nbsp;/&nbsp; GET IMAGES — REMOTE MCP SERVER ·
              V0.1 / 2026
            </p>
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-balance md:text-7xl lg:text-8xl"
          >
            <span
              className="block animate-mask-wipe"
              style={{ animationDelay: "120ms" }}
            >
              Bring Get Images
            </span>
            <span
              className="block animate-mask-wipe text-muted-foreground"
              style={{ animationDelay: "420ms" }}
            >
              into any agent.
            </span>
          </h1>

          {/* Sub-paragraph */}
          <p
            className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-up"
            style={{ animationDelay: "780ms", animationFillMode: "both" }}
          >
            Get Images is a remote Model Context Protocol server. Drop your
            API key into Claude Code, Codex, Claude Desktop, Cursor&apos;s
            agent skills, ChatGPT — or anything that speaks MCP — and your
            agent gains the ability to generate images on demand. This web UI
            is here so you can test prompts and pull back the frames your
            agents have already made. Every generation can target a different
            image model — today{" "}
            <span className="text-foreground/90">OpenAI Image 2</span> or{" "}
            <span className="text-foreground/90">Google Nanobanana Pro</span>,
            with
            more coming; swap backends per tool call or in the dashboard.
          </p>

          {/* Feature pills */}
          <ul
            role="list"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 animate-fade-up"
            style={{ animationDelay: "900ms", animationFillMode: "both" }}
          >
            {FEATURE_PILLS.map((pill, idx) => (
              <li key={pill} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 bg-primary"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {pill}
                </span>
                {idx < FEATURE_PILLS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="font-mono text-[10px] text-muted-foreground/60"
                  >
                    ·
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          {/* Image backends — swappable per request */}
          <div
            className="space-y-3 animate-fade-up"
            style={{ animationDelay: "980ms", animationFillMode: "both" }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Image models — pick per request · swap anytime
            </p>
            <ul
              role="list"
              className="flex flex-wrap gap-2"
            >
              {IMAGE_BACKENDS.map(({ vendor, slug }) => (
                <li
                  key={slug}
                  className="border border-border/60 bg-background/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/85"
                >
                  <span className="text-primary">{vendor}</span>
                  <span className="text-muted-foreground"> · </span>
                  {slug}
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center gap-5 animate-fade-up"
            style={{ animationDelay: "1100ms", animationFillMode: "both" }}
          >
            <Button
              asChild
              size="lg"
              className="glow-lime rounded-none px-6 font-mono text-xs uppercase tracking-[0.18em]"
            >
              <Link href="/register">Get an API key →</Link>
            </Button>
            <Link
              href="#flow"
              className="font-mono text-xs uppercase tracking-[0.18em] text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              See the flow ↓
            </Link>
          </div>

          {/* Works-with strip */}
          <div
            className="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-border/60 pt-6 animate-fade-up"
            style={{ animationDelay: "1240ms", animationFillMode: "both" }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              WORKS WITH —
            </span>
            <ul
              role="list"
              className="flex flex-wrap items-center gap-x-2 gap-y-1.5"
            >
              {WORKS_WITH.map((client, idx) => (
                <li key={client} className="flex items-center gap-2">
                  <span className="border border-border/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/80">
                    {client}
                  </span>
                  {idx < WORKS_WITH.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="font-mono text-[10px] text-muted-foreground/60"
                    >
                      ·
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT — terminal config block. The id="developers" anchor preserves
            the /#developers link in the site header now that the standalone
            developers section is folded into the hero. */}
        <div
          id="developers"
          className="scroll-mt-24 lg:col-span-5 lg:flex lg:items-center"
        >
          <div
            className="w-full animate-fade-up"
            style={{ animationDelay: "600ms", animationFillMode: "both" }}
          >
            <div className="relative overflow-hidden border border-border/60 bg-card shadow-[0_0_0_1px_oklch(0.9_0.22_130/0.04),0_24px_48px_-24px_oklch(0_0_0/0.7)]">
              {/* Title bar — traffic-light dots + filename + copy */}
              <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-[oklch(0.1_0.008_240)] px-4 py-2.5">
                <div className="flex items-center gap-2">
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
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    mcp · client config
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCopy}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Copy MCP configuration JSON"
                >
                  {copied ? "✓ COPIED" : "COPY"}
                </button>
              </div>

              {/* Tab strip — visual only. Communicates "this shape applies
                  everywhere"; tabs are not clickable by design. */}
              <div
                role="tablist"
                aria-label="Supported MCP clients"
                className="flex items-stretch overflow-x-auto border-b border-border/60 bg-[oklch(0.08_0.008_240)]"
              >
                {CLIENT_TABS.map((tab) => (
                  <div
                    key={tab.label}
                    role="tab"
                    aria-selected={tab.active}
                    tabIndex={-1}
                    className={
                      "flex shrink-0 items-center gap-2 border-r border-border/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] " +
                      (tab.active
                        ? "bg-card text-foreground"
                        : "text-muted-foreground")
                    }
                  >
                    {tab.active ? (
                      <span
                        aria-hidden="true"
                        className="inline-block size-1.5 rounded-full bg-primary"
                      />
                    ) : null}
                    <span>{tab.label}</span>
                  </div>
                ))}
              </div>

              {/* Body — syntax-highlighted JSON */}
              <ConfigJson />
              <p className="border-t border-border/60 bg-[oklch(0.09_0.008_240)] px-5 py-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
                Optional{" "}
                <span className="text-foreground/85">GET_IMAGES_MODEL</span>:
                swap{" "}
                <span className="text-primary/90">openai/image-2</span>
                {" ↔ "}
                <span className="text-primary/90">google/nanobanana-pro</span>
                {" "}
                per client or workspace.
              </p>

              {/* Footer row */}
              <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-[oklch(0.08_0.008_240)] px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  ← REMOTE · CONTEXT7-STYLE · API KEY + MODEL ·
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  READY IN 30S
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <Link
          href="#flow"
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-auto block font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground transition-colors hover:text-primary animate-fade-up [animation-iteration-count:infinite] [animation-direction:alternate] [animation-duration:1.8s]"
        >
          ↓ Scroll
        </Link>
      </div>
    </section>
  );
}
