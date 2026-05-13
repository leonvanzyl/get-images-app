import { z } from "zod";
import { mcpErrorResultFromException } from "@/lib/mcp/format";
import { listUserImages } from "@/services/images/queries";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

export function registerListImagesTool(server: McpServer): void {
  server.registerTool(
    "getimages_list_images",
    {
      title: "List generated images",
      description:
        "Return the caller's generated images, newest first. Paginated via `limit` (default 20, max 100) and `offset` (default 0). Returns image metadata only — use getimages_get_image with `includeBytes:true` to fetch the image bytes for a specific record.",
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
        const { images, total } = await listUserImages(userId, { limit, offset });

        return {
          content: [
            {
              type: "text",
              text: `Returned ${images.length} of ${total} image${total === 1 ? "" : "s"} (limit ${limit}, offset ${offset}).`,
            },
          ],
          structuredContent: {
            images,
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

export default registerListImagesTool;
