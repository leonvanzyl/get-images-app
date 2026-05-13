import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyMcpToken } from "@/lib/mcp/auth";
import { buildMcpServer } from "@/lib/mcp/server";

export const runtime = "nodejs";
// Vercel rejects values above the plan ceiling at build time (Hobby: 300s,
// Pro Standard: 300s, Pro Fluid: 800s, Enterprise: 900s). 300 is the safe
// max that builds on every plan; raise if you upgrade to Fluid.
export const maxDuration = 300;

const baseHandler = createMcpHandler(
  (server) => buildMcpServer(server),
  {},
  {
    basePath: "/api",
    // mcp-handler installs its OWN internal abort timer that defaults to 60s.
    // Without this, the handler aborts the response after 60s even though the
    // image generation finishes successfully on the backend — visible as a
    // generated image in the dashboard but a "timed out" error in the client.
    // Keep this in sync with the function timeout above.
    maxDuration: 300,
  },
);

const handler = withMcpAuth(baseHandler, verifyMcpToken, { required: true });

export { handler as GET, handler as POST, handler as DELETE };
