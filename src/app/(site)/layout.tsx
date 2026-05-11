import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Public-facing chrome shared by the landing page, the auth flow, and the
 * profile page. Dashboard routes live as a sibling of this group so they can
 * opt out of the public header/footer and render their own shell.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
