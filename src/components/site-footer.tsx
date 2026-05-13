import Link from "next/link";

type FooterColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Generate", href: "/dashboard" },
      { label: "Library", href: "/dashboard/library" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "MCP", href: "/dashboard/integrations" },
      { label: "API docs", href: "/docs/api" },
      { label: "API keys", href: "/dashboard/keys" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      className="mt-24 border-t bg-background"
      role="contentinfo"
    >
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 space-y-3 md:col-span-1">
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
            <p className="text-sm text-muted-foreground">
              AI images for humans and agents.
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Get Images
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <nav
              key={column.heading}
              aria-label={`${column.heading} links`}
              className="space-y-3"
            >
              <h2 className="text-sm font-medium text-foreground">
                {column.heading}
              </h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
