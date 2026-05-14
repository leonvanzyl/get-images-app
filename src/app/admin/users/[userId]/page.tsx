import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserActionsMenu } from "@/components/admin/user-actions-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { getUserDetail } from "@/services/admin/queries";

type Params = Promise<{ userId: string }>;

function formatAmount(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await requireAdmin();
  const { userId } = await params;
  const detail = await getUserDetail(userId);
  if (!detail) notFound();

  const { profile, recentGenerations, recentTransactions, recentAudit, activeSessionCount } = detail;
  const isSelf = profile.id === session.user.id;

  return (
    <div className="px-8 py-10 md:px-12 md:py-12">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to users
        </Link>
      </div>

      <header className="mb-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage
              src={profile.image ?? ""}
              alt={profile.name}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>
              {(profile.name?.[0] || profile.email?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-medium tracking-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.role === "admin" ? (
                <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full">
                  User
                </Badge>
              )}
              {profile.banned ? (
                <Badge className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive/15">
                  Banned
                </Badge>
              ) : null}
              {profile.emailVerified ? (
                <Badge variant="outline" className="rounded-full">
                  Email verified
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <UserActionsMenu
          userId={profile.id}
          userName={profile.name}
          userEmail={profile.email}
          currentRole={profile.role ?? "user"}
          isBanned={Boolean(profile.banned)}
          currentBalance={profile.balance}
          isSelf={isSelf}
        />
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Credit balance" value={profile.balance.toLocaleString()} />
        <Stat label="Generations" value={profile.generationCount.toLocaleString()} />
        <Stat label="Active sessions" value={activeSessionCount.toString()} />
        <Stat
          label="Joined"
          value={profile.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        />
      </section>

      {profile.banned && profile.banReason ? (
        <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Ban reason</p>
          <p className="mt-1 text-foreground/90">{profile.banReason}</p>
          {profile.banExpires ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Expires {profile.banExpires.toLocaleString()}
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium tracking-tight">
          Recent generations
        </h2>
        {recentGenerations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No generations yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16" />
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Prompt
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Model
                  </TableHead>
                  <TableHead className="text-right text-xs font-medium text-muted-foreground">
                    Cost
                  </TableHead>
                  <TableHead className="text-right text-xs font-medium text-muted-foreground">
                    When
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGenerations.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={g.imageUrl}
                          alt=""
                          fill
                          unoptimized
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm">
                      {g.prompt}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {g.modelId}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {g.creditCost ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {g.createdAt.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium tracking-tight">
          Recent transactions
        </h2>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
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
                {recentTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm">{t.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium tracking-tight">
          Audit events
        </h2>
        {recentAudit.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No admin actions targeting this user.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Action
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    By
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Notes
                  </TableHead>
                  <TableHead className="text-right text-xs font-medium text-muted-foreground">
                    When
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAudit.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="text-sm font-medium">
                      {ev.action}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ev.actorName ?? ev.actorEmail ?? ev.actorId ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ev.notes ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {ev.createdAt.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium tracking-tight">
        {value}
      </p>
    </div>
  );
}
