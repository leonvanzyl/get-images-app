import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { createRateLimiter } from "@/lib/rate-limit";

const authLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

// 16 random bytes, base64-encoded — fresh per request so we can use a strict,
// nonce-based CSP and let Next.js inject its own scripts under 'strict-dynamic'.
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    // Vercel Speed Insights / Analytics CDN — used in production.
    "https://va.vercel-scripts.com",
    // Required for Next.js HMR in dev; never enabled in production.
    isDev ? "'unsafe-eval'" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://*.public.blob.vercel-storage.com https://picsum.photos",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/**
 * Next.js 16 Proxy. Responsibilities:
 *   1. Rate-limit /api/auth/* (Polar webhooks are skipped — verified by signature).
 *   2. Optimistic cookie-only auth redirect for /dashboard/* and /profile/*.
 *      Full session validation still happens in pages via auth.api.getSession().
 *   3. Attach a per-request nonce-based Content-Security-Policy to HTML responses
 *      so we can drop 'unsafe-inline' / 'unsafe-eval' from script-src in prod.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    // Polar webhooks are server-to-server and verified by signature — skip rate limiting
    if (pathname === "/api/auth/polar/webhooks") {
      return NextResponse.next();
    }

    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const { success, remaining } = authLimiter.check(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  }

  // JSON APIs don't render HTML, so they don't need a CSP.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isProtected =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/");

  if (isProtected) {
    const sessionCookie = getSessionCookie(request);
    // Optimistic redirect - cookie existence check only
    // Full validation happens in page components via auth.api.getSession()
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Attach CSP with a fresh nonce. Two request headers are set:
  //   - x-nonce: read by RootLayout via headers() to nonce our JSON-LD script.
  //   - Content-Security-Policy: Next.js parses the nonce out of this header
  //     (next/dist/server/app-render/get-script-nonce-from-header.js) and
  //     stamps it onto its own injected framework/RSC <script> tags. Without
  //     this, 'strict-dynamic' blocks Next.js's own scripts in production.
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
