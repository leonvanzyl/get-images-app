"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyCodeBlock } from "./copy-code-block";

/**
 * Per-client install recipes. The snippet shape is the same across all three
 * clients — a top-level `mcpServers` block with a streamable-HTTP server entry
 * authed by an `Authorization: Bearer` header — so each tab only differs in
 * its description and filename hint.
 */
type SnippetConfig = {
  id: string;
  label: string;
  filename: string;
  description: string;
  template: string;
};

const REMOTE_MCP_BLOCK = `{
  "mcpServers": {
    "get-images": {
      "type": "http",
      "url": "https://getimages.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer {KEY}"
      }
    }
  }
}`;

const SNIPPETS: SnippetConfig[] = [
  {
    id: "claude",
    label: "Claude Desktop",
    filename: "claude_desktop_config.json",
    description:
      "Add this to your Claude Desktop config and restart the app. macOS: ~/Library/Application Support/Claude/claude_desktop_config.json · Windows: %APPDATA%\\Claude\\claude_desktop_config.json. The full setup guide — including other clients — lives in the MCP docs.",
    template: REMOTE_MCP_BLOCK,
  },
  {
    id: "cursor",
    label: "Cursor",
    filename: "mcp.json",
    description:
      "Save this to ~/.cursor/mcp.json for global access, or .cursor/mcp.json inside a project. Reload MCP from the command palette afterwards.",
    template: REMOTE_MCP_BLOCK,
  },
  {
    id: "vscode",
    label: "VS Code",
    filename: ".vscode/mcp.json",
    description:
      "Drop this into your VS Code MCP config. The shape is the same across clients — a streamable-HTTP server entry under mcpServers with an Authorization Bearer header.",
    template: REMOTE_MCP_BLOCK,
  },
];

export interface InstallSnippetsProps {
  /** Full saved key or `{KEY}` placeholder to inline into each snippet. */
  apiKey: string;
}

export function InstallSnippets({ apiKey }: InstallSnippetsProps) {
  const defaultTab = SNIPPETS[0]!.id;

  return (
    <section aria-labelledby="install-snippets-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="install-snippets-heading" className="font-display text-lg font-medium">
          Install snippets
        </h2>
        <p className="text-muted-foreground text-sm">
          Paste the snippet for your client and replace {"{KEY}"} with the full key you saved when
          it was created.
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {SNIPPETS.map((snippet) => (
            <TabsTrigger key={snippet.id} value={snippet.id}>
              {snippet.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SNIPPETS.map((snippet) => {
          const code = snippet.template.replace("{KEY}", apiKey);
          return (
            <TabsContent key={snippet.id} value={snippet.id} className="mt-4 space-y-3">
              <p className="text-muted-foreground text-sm">{snippet.description}</p>
              <CopyCodeBlock filename={snippet.filename} code={code} />
            </TabsContent>
          );
        })}
      </Tabs>

      <p className="text-muted-foreground text-xs">
        Using a different client?{" "}
        <Link
          href="/docs/mcp"
          className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Read the full MCP setup guide
        </Link>{" "}
        for client-by-client instructions and the tool reference.
      </p>
    </section>
  );
}
