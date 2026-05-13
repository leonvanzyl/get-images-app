import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { IntegrationKeySelection } from "@/components/integrations/key-picker";
import { McpOverview } from "@/components/integrations/mcp-overview";
import { Button } from "@/components/ui/button";
import { listApiKeysAction } from "../keys/actions";

/**
 * Integrations page.
 *
 * The server component loads the user's active keys. A small client subtree
 * owns selected-key state so the picker and install snippets stay in sync.
 */
export default async function IntegrationsPage() {
  const keys = await listApiKeysAction();
  const activeKeys = keys.filter((key) => key.enabled);

  return (
    <section className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            Integrations
          </h1>
          <p className="text-muted-foreground">
            Hook your AI agents into Get Images via MCP.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/docs/mcp">
              <BookOpenText className="size-4" />
              Read MCP docs
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/docs/api">
              <BookOpenText className="size-4" />
              REST API docs
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-8">
        <McpOverview />
        <IntegrationKeySelection keys={activeKeys} />
      </div>
    </section>
  );
}
