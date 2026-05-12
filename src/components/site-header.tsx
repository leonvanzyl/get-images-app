import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";

const NAV_LINKS = [
  { href: "/#manifesto", label: "Manifesto" },
  { href: "/#examples", label: "Examples" },
  { href: "/#developers", label: "Developers" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header
        className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60"
        role="banner"
      >
        <nav
          className="container mx-auto flex items-center justify-between gap-6 px-4 py-3 sm:px-6"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            aria-label="Get Images — Go to homepage"
            className="group flex items-center gap-2"
          >
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full bg-primary animate-cursor-blink shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)]"
            />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-foreground">
              Get Images
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-px bg-border"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              / V0.1
            </span>
          </Link>

          <ul className="hidden items-center gap-6 md:flex" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div
            className="flex items-center gap-2 sm:gap-3"
            role="group"
            aria-label="User actions"
          >
            <UserProfile />
            <ModeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}
