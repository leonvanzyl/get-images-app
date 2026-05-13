import { z } from "zod";
import { mcpErrorResultFromException } from "@/lib/mcp/format";
import { listCreditTransactions } from "@/services/credits/queries";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

export function registerListUsageTool(server: McpServer): void {
  server.registerTool(
    "getimages_list_usage",
    {
      title: "List credit transactions",
      description:
        "Return the caller's credit transaction history (deductions for generations, refunds, and additions from purchases), newest first. Paginated via `limit` (default 20, max 100) and `offset` (default 0).",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, { authInfo }) => {
      const userId = authInfo!.extra!.userId as string;
      const limit = args.limit ?? DEFAULT_LIMIT;
      const offset = args.offset ?? DEFAULT_OFFSET;

      try {
        const { transactions, total } = await listCreditTransactions(userId, {
          limit,
          offset,
        });

        return {
          content: [
            {
              type: "text",
              text: `Returned ${transactions.length} of ${total} transaction${total === 1 ? "" : "s"} (limit ${limit}, offset ${offset}).`,
            },
          ],
          structuredContent: {
            transactions,
            total,
            limit,
            offset,
          },
        };
      } catch (err) {
        return mcpErrorResultFromException(err);
      }
    },
  );
}

export default registerListUsageTool;
