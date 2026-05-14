import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";
import { FileCode, KeyRound } from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent skill docs",
  description:
    "Install the Get Images agent skill to teach Claude, Cursor, Codex, and other coding agents how to use the Get Images MCP server well.",
};

const markdownPath = path.join(process.cwd(), "docs", "skill.md");

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-12 scroll-mt-24 font-display text-2xl font-medium tracking-tight md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-xl font-medium tracking-tight">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 leading-relaxed text-muted-foreground">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-2xl border bg-card p-4 text-xs leading-relaxed shadow-sm">
      {children}
    </pre>
  ),
  code: ({ className, children }) => (
    <code
      className={cn(
        "font-mono",
        className
          ? "text-xs text-foreground"
          : "rounded-md bg-muted px-1.5 py-0.5 text-[0.85em] text-foreground"
      )}
    >
      {children}
    </code>
  ),
  strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
  details: ({ children }) => (
    <details className="group mt-3 overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow open:shadow-md [&>*:not(summary)]:px-5 [&>*:last-child:not(summary)]:pb-5">
      {children}
    </details>
  ),
  summary: ({ children }) => (
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-base font-medium text-foreground transition-colors hover:bg-accent group-open:border-b group-open:bg-accent/50 [&::-webkit-details-marker]:hidden">
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="text-muted-foreground transition-transform group-open:rotate-90"
      >
        ›
      </span>
    </summary>
  ),
};

async function getMarkdown() {
  const markdown = await fs.readFile(markdownPath, "utf8");
  return markdown.replace(/^# .+\r?\n+/, "");
}

export default async function SkillDocsPage() {
  const markdown = await getMarkdown();

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:py-24">
      <header className="max-w-3xl space-y-4">
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
          Agent skill
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          A drop-in skill that teaches Claude, Cursor, Codex, and other coding
          agents how to use the Get Images MCP server well — model and aspect
          ratio choices, prompt drafting, storage, and web optimization.
        </p>
        <div className="flex flex-wrap gap-3 pt-3">
          <Button asChild>
            <Link href="/dashboard/keys">
              <KeyRound className="size-4" />
              Create API key
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs/mcp">
              <FileCode className="size-4" />
              MCP setup
            </Link>
          </Button>
        </div>
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-[220px_1fr] lg:items-start">
        <aside className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-medium">Resources</h2>
          <nav aria-label="Skill docs resources" className="mt-4 space-y-2">
            <Link
              href="/docs/api"
              className="block rounded-[10px] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              REST API
            </Link>
            <Link
              href="/docs/mcp"
              className="block rounded-[10px] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Remote MCP
            </Link>
            <Link
              href="/docs/skill"
              className="block rounded-[10px] bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
            >
              Agent skill
            </Link>
            <Link
              href="/dashboard/keys"
              className="block rounded-[10px] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              API keys
            </Link>
          </nav>
        </aside>

        <article className="min-w-0 rounded-2xl border bg-card px-5 py-2 shadow-sm sm:px-8">
          <Markdown components={markdownComponents} rehypePlugins={[rehypeRaw]}>
            {markdown}
          </Markdown>
        </article>
      </div>
    </div>
  );
}
