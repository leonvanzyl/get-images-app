import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Get Images",
    short_name: "Get Images",
    description:
      "Generate beautiful images from a prompt, and wire them into any AI agent via MCP.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0d",
    theme_color: "#c8ff3a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
