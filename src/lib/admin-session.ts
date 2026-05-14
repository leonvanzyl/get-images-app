import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Resolved session shape with the admin-plugin role surface. Better Auth
 * stores the role on the user record; we pull it back via the standard
 * getSession path and narrow it here for downstream consumers.
 */
export type AdminSession = Awaited<ReturnType<typeof auth.api.getSession>> & {};

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as { role?: string | null }).role ?? "user";
  if (role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return false;
  return (session.user as { role?: string | null }).role === "admin";
}
