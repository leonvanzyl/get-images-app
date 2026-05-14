import { z } from "zod";
import { mcpErrorResultFromException } from "@/lib/mcp/format";
import { signImageUrl } from "@/lib/mcp/signed-urls";
import {
  runGeneration,
  SUPPORTED_ASPECT_RATIOS,
  type ImageModelDefinition,
  type RunGenerationInput,
} from "@/services/image-generation";
import { loadActiveModels } from "@/services/image-generation/model-repository";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const COMMON_ASPECT_RATIOS = "1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4";

function buildDescription(models: ImageModelDefinition[]): string {
  const modelList = models.map((m) => `- ${m.id}: ${m.description}`).join("\n");
  const thinkingModels = models
    .filter((m) => m.thinking)
    .map((m) => m.id)
    .join(", ");

  return [
    "Generate an image from a text prompt and return it as an MCP image content block plus metadata.",
    "",
    "WARNING: This tool spends credits from the caller's account. Each successful call is irreversibly billed against the account.",
    "",
    "The response includes a short-lived signed `imageUrl` in structuredContent — agents can fetch this URL over HTTP and save the bytes to disk. The URL expires in 15 minutes.",
    "",
    "Available models:",
    modelList,
    "",
    `Aspect ratios: ${COMMON_ASPECT_RATIOS}. Gemini 3 Pro Image (google:gemini-3-pro-image-preview) additionally supports 21:9.`,
    "",
    `Thinking levels "default" and "deep" are supported only on: ${thinkingModels}. Other models reject the parameter.`,
  ].join("\n");
}

export async function registerGenerateImageTool(server: McpServer): Promise<void> {
  const models = await loadActiveModels();
  server.registerTool(
    "getimages_generate_image",
    {
      title: "Generate an image",
      description: buildDescription(models),
      inputSchema: {
        prompt: z.string().trim().min(1).max(8000),
        modelId: z.string().min(1),
        aspectRatio: z.enum(SUPPORTED_ASPECT_RATIOS).optional(),
        style: z.string().optional(),
        thinkingLevel: z.enum(["default", "deep"]).optional(),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args, { authInfo, _meta, sendNotification }) => {
      const userId = authInfo!.extra!.userId as string;
      const progressToken = _meta?.progressToken;

      // Heartbeat so MCP clients reset their per-tool-call timeout while we
      // wait on the provider. Many clients default to a 60s tool timeout, and
      // gpt-image-2 / gemini-3-pro routinely run past that. Only emitted when
      // the caller supplied a progressToken; otherwise the notification has
      // no route on the client and would be silently dropped.
      let progress = 0;
      const heartbeat =
        progressToken !== undefined
          ? setInterval(() => {
              void sendNotification({
                method: "notifications/progress",
                params: {
                  progressToken,
                  progress: ++progress,
                  message: `Still generating with ${args.modelId}…`,
                },
              }).catch(() => {
                // Best-effort: a failed notification must not abort the call.
              });
            }, 10_000)
          : null;

      try {
        const input: RunGenerationInput = {
          prompt: args.prompt,
          modelId: args.modelId,
          ...(args.aspectRatio !== undefined ? { aspectRatio: args.aspectRatio } : {}),
          ...(args.style !== undefined ? { style: args.style } : {}),
          ...(args.thinkingLevel !== undefined ? { thinkingLevel: args.thinkingLevel } : {}),
        };

        const result = await runGeneration(userId, input);

        return {
          content: [
            {
              type: "image",
              data: result.bytes.toString("base64"),
              mimeType: result.mediaType,
            },
            {
              type: "text",
              text: `Generated. Charged ${result.credits.charged} credits, ${result.credits.remaining} remaining. ID: ${result.image.id}`,
            },
          ],
          structuredContent: {
            id: result.image.id,
            prompt: result.image.prompt,
            modelId: result.image.modelId,
            providerId: result.image.providerId,
            aspectRatio: result.image.aspectRatio,
            style: result.image.style ?? null,
            thinkingLevel: result.image.thinkingLevel ?? null,
            mediaType: result.mediaType,
            credits: result.credits,
            createdAt: result.image.createdAt,
            imageUrl: signImageUrl(userId, result.image.id),
          },
        };
      } catch (err) {
        return mcpErrorResultFromException(err, "Image generation failed.");
      } finally {
        if (heartbeat) clearInterval(heartbeat);
      }
    },
  );
}

export default registerGenerateImageTool;
