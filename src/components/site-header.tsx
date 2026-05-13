import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { getOptionalSession } from "@/lib/session";

type NavLink = { href: string; label: string };

/**
 * Marketing nav. Anchors point at the in-page sections of the landing route;
 * the Dashboard link is only injected when a session exists.
 */
const NAV_LINKS: NavLink[] = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs/api", label: "Docs" },
];

export async function SiteHeader() {
  const session = await getOptionalSession();
  const navLinks: NavLink[] = session
    ? [...NAV_LINKS, { href: "/dashboard", label: "Dashboard" }]
    : NAV_LINKS;

  return (
    <>
      {/* Skip link — only visible when focused. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[10px] focus:border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-md"
      >
        Skip to main content
      </a>
      <header
        className="sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur"
        role="banner"
      >
        <div className="container mx-auto flex h-full max-w-6xl items-center justify-between gap-6 px-6">
          {/* Wordmark — coral square + name */}
          <Link
            href="/"
            aria-label="Get Images — Go to homepage"
            className="flex items-center gap-2.5"
          >
            <span
              aria-hidden="true"
              className="inline-block size-6 rounded-md bg-primary"
            />
            <span className="font-display text-lg font-medium text-foreground">
              get images
            </span>
          </Link>

          {/* Center nav */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2" aria-label="User actions">
            {session ? (
              <UserProfile />
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
