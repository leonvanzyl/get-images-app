"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CopyCodeBlock } from "./copy-code-block";

/**
 * Per-client install recipes. Remote MCP block matches Context 7's shape
 * (type, url, headers, enabled under `mcp.<serverId>`). `{KEY}` is replaced
 * with the selected key prefix for copy.
 */
type SnippetConfig = {
  id: string;
  label: string;
  filename: string;
  description: string;
  template: string;
  note: string;
};

const REMOTE_MCP_BLOCK = `{
  "mcp": {
    "get-images": {
      "type": "remote",
      "url": "https://mcp.get-images.dev/mcp",
      "headers": {
        "GET_IMAGES_API_KEY": "{KEY}",
        "GET_IMAGES_MODEL": "openai/image-2"
      },
      "enabled": true
    }
  }
}`;

const SNIPPETS: SnippetConfig[] = [
  {
    id: "claude",
    label: "CLAUDE DESKTOP",
    filename: "claude_desktop_config.json",
    description:
      "Same shape as Context 7: top-level mcp object with a remote server entry. Path — macOS: ~/Library/Application Support/Claude/claude_desktop_config.json · Windows: %APPDATA%\\Claude\\claude_desktop_config.json. Merge into existing mcp if you already use other servers.",
    template: REMOTE_MCP_BLOCK,
    note: "Restart Claude Desktop. Swap GET_IMAGES_MODEL to google/nanobanana-pro when you want Google's image model.",
  },
  {
    id: "cursor",
    label: "CURSOR",
    filename: "mcp.json",
    description:
      "Global ~/.cursor/mcp.json or project .cursor/mcp.json — match the remote MCP pattern your Cursor build expects (Context 7-style mcp map shown below).",
    template: REMOTE_MCP_BLOCK,
    note: "Reload MCP from the command palette after saving.",
  },
  {
    id: "vscode",
    label: "VS CODE / CONTINUE",
    filename: ".continue/config.json",
    description:
      "If your VS Code MCP / Continue setup merges a top-level mcp block, paste this fragment; otherwise map the same type, url, headers, and enabled fields into your client's remote-MCP format.",
    template: REMOTE_MCP_BLOCK,
    note: "GET_IMAGES_API_KEY is your Get Images API key. Model header picks the provider (openai/image-2 or google/nanobanana-pro).",
  },
  {
    id: "generic",
    label: "REFERENCE JSON",
    filename: "get-images-mcp.json",
    description:
      "Portable reference: remote MCP server with API key and optional model in headers — parallel to Context 7's CONTEXT7_API_KEY pattern.",
    template: REMOTE_MCP_BLOCK,
    note: "Paste your real key in GET_IMAGES_API_KEY. Toggle enabled when you're ready.",
  },
];

export interface InstallSnippetsProps {
  /** Key prefix (or `{KEY}` placeholder) to inline into each snippet. */
  apiKey: string;
}

export function InstallSnippets({ apiKey }: InstallSnippetsProps) {
  const defaultTab = SNIPPETS[0]!.id;

  return (
    <section
      aria-labelledby="install-snippets-heading"
      className="space-y-5"
    >
      <div className="space-y-2">
        <p
          id="install-snippets-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary"
        >
          03 — INSTALL SNIPPETS
        </p>
        <p className="max-w-prose text-sm text-muted-foreground">
          Paste the snippet for your client. The selected key is inlined for
          you — copy, save, restart, done.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="gap-0">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border/60 p-0"
        >
          {SNIPPETS.map((snippet) => (
            <TabsTrigger
              key={snippet.id}
              value={snippet.id}
              className="rounded-none px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] data-[state=active]:text-primary data-[state=active]:after:bg-primary"
            >
              {snippet.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SNIPPETS.map((snippet) => {
          const code = snippet.template.replace("{KEY}", apiKey);
          return (
            <TabsContent
              key={snippet.id}
              value={snippet.id}
              className="mt-6 space-y-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {snippet.description}
              </p>
              <CopyCodeBlock filename={snippet.filename} code={code} />
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                <span aria-hidden="true" className="mr-1.5 text-primary">
                  →
                </span>
                {snippet.note}
              </p>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
