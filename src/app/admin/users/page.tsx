import Link from "next/link";
import { UserActionsMenu } from "@/components/admin/user-actions-menu";
import { UsersToolbar } from "@/components/admin/users-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/admin-session";
import { listUsersForAdmin } from "@/services/admin/queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;

  const q = asString(sp.q) ?? "";
  const roleRaw = asString(sp.role) ?? "all";
  const role: "admin" | "user" | "all" =
    roleRaw === "admin" || roleRaw === "user" ? roleRaw : "all";
  const bannedRaw = asString(sp.banned) ?? "all";
  const banned: "yes" | "no" | "all" =
    bannedRaw === "yes" || bannedRaw === "no" ? bannedRaw : "all";
  const page = Math.max(1, Number(asString(sp.page) ?? "1") || 1);

  const { rows, total, pageSize } = await listUsersForAdmin({
    search: q,
    role,
    banned,
    page,
  });
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function buildPageHref(p: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "all") params.set("role", role);
    if (banned !== "all") params.set("banned", banned);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight">
            Users
          </h1>
          <p className="text-muted-foreground">
            Search, filter, and manage every account on the platform.
          </p>
        </div>
      </header>

      <UsersToolbar
        initialQuery={q}
        initialRole={role}
        initialBanned={banned}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground">
                User
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                Balance
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                Generations
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                Joined
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No users match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Avatar className="size-8">
                        <AvatarImage
                          src={u.image ?? ""}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="text-xs">
                          {(u.name?.[0] || u.email?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {u.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {u.email}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {u.role === "admin" ? (
                      <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">
                        Admin
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">User</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.banned ? (
                      <Badge className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive/15">
                        Banned
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Active</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {u.balance}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {u.generationCount}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {u.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActionsMenu
                      userId={u.id}
                      userName={u.name}
                      userEmail={u.email}
                      currentRole={u.role ?? "user"}
                      isBanned={Boolean(u.banned)}
                      currentBalance={u.balance}
                      isSelf={u.id === session.user.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > pageSize ? (
        <nav
          aria-label="Pagination"
          className="mt-6 flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Page {page} of {lastPage} · {total} users
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page <= 1}
            >
              <Link href={buildPageHref(Math.max(1, page - 1))}>Previous</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
            >
              <Link href={buildPageHref(Math.min(lastPage, page + 1))}>Next</Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
