import { mcpErrorResult, mcpErrorResultFromException } from "@/lib/mcp/format";
import { getAccountInfo } from "@/services/account/queries";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetAccountTool(server: McpServer): void {
  server.registerTool(
    "getimages_get_account",
    {
      title: "Get account info",
      description:
        "Return the authenticated caller's userId, email address, and current credit balance. Use this before generate_image to confirm there are enough credits available.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_extra) => {
      const authInfo = _extra.authInfo;
      const userId = authInfo!.extra!.userId as string;

      try {
        const account = await getAccountInfo(userId);
        if (!account) {
          return mcpErrorResult("Account not found.");
        }

        return {
          content: [
            {
              type: "text",
              text: `Credit balance: ${account.creditBalance}. Email: ${account.email}`,
            },
          ],
          structuredContent: {
            userId: account.userId,
            email: account.email,
            creditBalance: account.creditBalance,
          },
        };
      } catch (err) {
        return mcpErrorResultFromException(err);
      }
    },
  );
}

export default registerGetAccountTool;
