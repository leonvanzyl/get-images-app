import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyMcpToken } from "@/lib/mcp/auth";
import { buildMcpServer } from "@/lib/mcp/server";

export const runtime = "nodejs";
// Vercel function ceiling. Plan maxes: Hobby 60s, Pro Standard 300s,
// Pro Fluid Compute 800s, Enterprise 900s. Vercel silently clamps to the
// active plan's ceiling — 800 here is "give us the max your tier allows".
export const maxDuration = 800;

const baseHandler = createMcpHandler(
  (server) => buildMcpServer(server),
  {},
  {
    basePath: "/api",
    // mcp-handler installs its OWN internal abort timer that defaults to 60s.
    // Without this, the handler aborts the response after 60s even though the
    // image generation finishes successfully on the backend — visible as a
    // generated image in the dashboard but a "timed out" error in the client.
    // Set this to the same ceiling as the function timeout.
    maxDuration: 800,
  },
);

const handler = withMcpAuth(baseHandler, verifyMcpToken, { required: true });

export { handler as GET, handler as POST, handler as DELETE };
