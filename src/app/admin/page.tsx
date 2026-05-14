import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCreditStats,
  getGenerationStats,
  getRecentAuditEvents,
  getTopUsersByGenerations,
  getUserStats,
} from "@/services/admin/queries";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-medium tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "Just now";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminOverviewPage() {
  const [userStats, genStats, creditStats, topUsers, recentAudit] =
    await Promise.all([
      getUserStats(),
      getGenerationStats(),
      getCreditStats(),
      getTopUsersByGenerations({ days: 30, limit: 10 }),
      getRecentAuditEvents({ limit: 10 }),
    ]);

  return (
    <div className="px-8 py-10 md:px-12 md:py-12">
      <header className="mb-10 space-y-2">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Overview
        </h1>
        <p className="text-muted-foreground">
          Platform health at a glance — users, generations, and credit flow.
        </p>
      </header>

      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          label="Users"
          value={userStats.total.toLocaleString()}
          hint={`${userStats.signupsLast7Days} new this week · ${userStats.banned} banned`}
        />
        <StatCard
          label="Admins"
          value={userStats.admins.toLocaleString()}
        />
        <StatCard
          label="Signups (30d)"
          value={userStats.signupsLast30Days.toLocaleString()}
        />
        <StatCard
          label="Generations"
          value={genStats.total.toLocaleString()}
          hint={`${genStats.last24h} in last 24h · ${genStats.last7Days} this week`}
        />
        <StatCard
          label="Credits in circulation"
          value={creditStats.totalBalance.toLocaleString()}
        />
        <StatCard
          label="Credits spent (all-time)"
          value={creditStats.totalSpent.toLocaleString()}
          hint={`${creditStats.totalPurchased.toLocaleString()} purchased · ${creditStats.totalRefunded.toLocaleString()} refunded`}
        />
      </section>

      <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <header className="mb-4 space-y-1">
            <h2 className="font-display text-lg font-medium">
              Top users (last 30 days)
            </h2>
            <p className="text-xs text-muted-foreground">
              By generation count.
            </p>
          </header>
          {topUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    User
                  </TableHead>
                  <TableHead className="text-right text-xs font-medium text-muted-foreground">
                    Generations
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.map((u) => (
                  <TableRow key={u.userId}>
                    <TableCell>
                      <Link
                        href={`/admin/users/${u.userId}`}
                        className="block hover:underline"
                      >
                        <span className="block text-sm font-medium text-foreground">
                          {u.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {u.email}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {u.generations}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <header className="mb-4 space-y-1">
            <h2 className="font-display text-lg font-medium">
              Recent admin activity
            </h2>
            <p className="text-xs text-muted-foreground">
              Last 10 audit events.
            </p>
          </header>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No admin actions yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentAudit.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{ev.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ev.actorName ?? ev.actorEmail ?? ev.actorId ?? "Unknown"}{" "}
                      {ev.targetType ? `· ${ev.targetType}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(ev.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-10">
        <Link
          href="/admin/audit"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          View full audit log →
        </Link>
      </section>
    </div>
  );
}
