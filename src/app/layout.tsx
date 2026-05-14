import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const fontDisplay = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const fontBody = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Get Images — AI image generation for humans and agents",
    template: "%s | Get Images",
  },
  description:
    "Generate beautiful images from a prompt, and wire them into any AI agent via MCP.",
  keywords: [
    "AI image generation",
    "MCP",
    "Model Context Protocol",
    "image API",
    "generative AI",
    "AI agents",
    "Next.js",
  ],
  authors: [{ name: "Get Images" }],
  creator: "Get Images",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Get Images",
    title: "Get Images — AI image generation for humans and agents",
    description:
      "Generate beautiful images from a prompt, and wire them into any AI agent via MCP.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Images — AI image generation for humans and agents",
    description:
      "Generate beautiful images from a prompt, and wire them into any AI agent via MCP.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Get Images",
  description:
    "Generate beautiful images from a prompt, and wire them into any AI agent via MCP.",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "Get Images",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce is injected by src/proxy.ts so this inline script passes the
  // strict, nonce-based CSP. Falls back to undefined on routes the proxy
  // didn't touch — the script still renders, just without a nonce.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Browsers strip the `nonce` attribute from script elements after the
          page is parsed (Chrome/Firefox security feature to prevent attacker
          scripts from reading sibling nonces). React then sees the DOM has
          no nonce while the virtual DOM still does, triggering a hydration
          warning. The mismatch is benign — the nonce already did its CSP
          job at parse time — so we suppress it for this element only.
        */}
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
