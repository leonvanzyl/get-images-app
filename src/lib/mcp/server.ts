import { registerGenerateImageTool } from "@/lib/mcp/tools/generate-image";
import { registerGetAccountTool } from "@/lib/mcp/tools/get-account";
import { registerGetImageTool } from "@/lib/mcp/tools/get-image";
import { registerListImagesTool } from "@/lib/mcp/tools/list-images";
import { registerListUsageTool } from "@/lib/mcp/tools/list-usage";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register all get-images MCP tools on the given server instance.
 *
 * Order is non-functional but matches the documented capability order
 * (generate, list, get, account, usage).
 */
export function buildMcpServer(server: McpServer): void {
  registerGenerateImageTool(server);
  registerListImagesTool(server);
  registerGetImageTool(server);
  registerGetAccountTool(server);
  registerListUsageTool(server);
}
