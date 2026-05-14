import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { listAllCreditTransactions } from "@/services/admin/queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

const TYPES = ["all", "addition", "deduction", "refund", "admin_adjustment"] as const;

function formatAmount(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const type = asString(sp.type) ?? "all";
  const userId = asString(sp.userId);
  const page = Math.max(1, Number(asString(sp.page) ?? "1") || 1);

  const { rows, total, pageSize } = await listAllCreditTransactions({
    ...(userId ? { userId } : {}),
    ...(type ? { type } : {}),
    page,
  });
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function buildHref(p: Partial<{ type: string; userId: string; page: number }>) {
    const params = new URLSearchParams();
    const t = p.type ?? type;
    if (t !== "all") params.set("type", t);
    const u = p.userId ?? userId;
    if (u) params.set("userId", u);
    const pp = p.page ?? page;
    if (pp > 1) params.set("page", String(pp));
    const qs = params.toString();
    return `/admin/transactions${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-8 space-y-2">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Transactions
        </h1>
        <p className="text-muted-foreground">
          Every credit movement across the platform.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Link
            key={t}
            href={buildHref({ type: t, page: 1 })}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              type === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {t === "all" ? "All types" : t}
          </Link>
        ))}
        {userId ? (
          <Link
            href={buildHref({ userId: "" })}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear user filter
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground">
                User
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">
                When
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No transactions match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${t.userId}`}
                      className="block hover:underline"
                    >
                      <span className="block text-sm font-medium text-foreground">
                        {t.userName ?? t.userId}
                      </span>
                      {t.userEmail ? (
                        <span className="block text-xs text-muted-foreground">
                          {t.userEmail}
                        </span>
                      ) : null}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{t.type}</TableCell>
                  <TableCell className="max-w-md text-sm text-muted-foreground">
                    {t.description ?? "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm",
                      t.amount >= 0 ? "text-foreground" : "text-destructive",
                    )}
                  >
                    {formatAmount(t.amount)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {t.createdAt.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > pageSize ? (
        <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
          <p className="text-sm text-muted-foreground">
            Page {page} of {lastPage} · {total} transactions
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link href={buildHref({ page: Math.max(1, page - 1) })}>Previous</Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= lastPage}>
              <Link href={buildHref({ page: Math.min(lastPage, page + 1) })}>Next</Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
