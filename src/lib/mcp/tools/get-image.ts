import { z } from "zod";
import { readImageBytes } from "@/app/api/v1/_lib/storage";
import { mcpErrorResult, mcpErrorResultFromException } from "@/lib/mcp/format";
import { signImageUrl } from "@/lib/mcp/signed-urls";
import { getUserImage } from "@/services/images/queries";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function registerGetImageTool(server: McpServer): void {
  server.registerTool(
    "getimages_get_image",
    {
      title: "Get an image",
      description:
        "Fetch metadata for a single image the caller owns. When `includeBytes` is true, the response also contains the image as an MCP image content block (the base64 bytes are NOT duplicated into structuredContent to keep context cost low). Both response shapes include a short-lived signed `imageUrl` in structuredContent — agents can fetch this URL over HTTP to save the bytes to disk. The URL expires in 15 minutes.",
      inputSchema: {
        id: z.string().uuid(),
        includeBytes: z.boolean().optional(),
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

      try {
        const record = await getUserImage(userId, args.id);
        if (!record) {
          return mcpErrorResult("Image not found.");
        }

        const { metadata, imageUrl } = record;

        if (args.includeBytes) {
          const bytes = await readImageBytes(imageUrl);
          if (!bytes) {
            return mcpErrorResult("Image bytes not found.");
          }

          const result: CallToolResult = {
            content: [
              {
                type: "image",
                data: bytes.toString("base64"),
                mimeType: metadata.mediaType,
              },
              {
                type: "text",
                text: `Image ${metadata.id} (${metadata.modelId}, ${metadata.aspectRatio}).`,
              },
            ],
            structuredContent: {
              image: metadata,
              imageUrl: signImageUrl(userId, metadata.id),
            },
          };
          return result;
        }

        return {
          content: [
            {
              type: "text",
              text: `Image ${metadata.id} (${metadata.modelId}, ${metadata.aspectRatio}). Call again with includeBytes:true to fetch the pixels.`,
            },
          ],
          structuredContent: {
            image: metadata,
            imageUrl: signImageUrl(userId, metadata.id),
          },
        };
      } catch (err) {
        return mcpErrorResultFromException(err);
      }
    },
  );
}

export default registerGetImageTool;
