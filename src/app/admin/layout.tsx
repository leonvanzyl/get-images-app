import { AdminChrome } from "@/components/admin/admin-chrome";
import { requireAdmin } from "@/lib/admin-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const impersonatedBy = (
    session.session as { impersonatedBy?: string | null } | undefined
  )?.impersonatedBy;
  const isImpersonating = Boolean(impersonatedBy);

  return (
    <AdminChrome
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      isImpersonating={isImpersonating}
      {...(isImpersonating
        ? {
            impersonationTarget: {
              name: session.user.name,
              email: session.user.email,
            },
          }
        : {})}
    >
      {children}
    </AdminChrome>
  );
}
