/**
 * Bootstrap admin allowlist. The contents of `ADMIN_EMAILS` (comma-separated)
 * are parsed once per process and cached as a Set for O(1) membership checks.
 *
 * On first sign-up, a user whose email is in this set is promoted to `admin`
 * via the `databaseHooks.user.create.before` hook in `auth.tsx`. On every
 * session creation, pre-existing users whose email matches are also promoted
 * via the `databaseHooks.session.create.after` hook — this self-heals when an
 * operator is added to the allowlist after the user already signed up.
 */

let cached: Set<string> | null = null;

function buildSet(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (!cached) cached = buildSet();
  return cached.has(email.toLowerCase());
}
