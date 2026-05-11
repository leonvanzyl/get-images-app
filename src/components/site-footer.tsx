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
      { label: "API", href: "/dashboard/keys" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "MCP", href: "/dashboard/integrations" },
      { label: "Examples", href: "/#examples" },
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
      className="mt-24 border-t border-border/60 bg-background/40"
      role="contentinfo"
    >
      <div className="container mx-auto grid gap-12 px-4 py-12 sm:px-6 md:grid-cols-[1fr_2fr] md:py-16">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full bg-primary"
            />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-foreground">
              Get Images
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            © 2026 — UI Demo
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3"
        >
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="space-y-3">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {column.heading}
              </h2>
              <ul className="space-y-2" role="list">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="font-mono text-xs uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
