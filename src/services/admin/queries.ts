import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
  sum,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  adminAuditLog,
  creditBalance,
  creditTransaction,
  generation,
  model as modelTable,
  session as sessionTable,
  user,
} from "@/lib/schema";

/* -------------------------------------------------------------------------- */
/*  Overview KPIs                                                              */
/* -------------------------------------------------------------------------- */

export type UserStats = {
  total: number;
  banned: number;
  admins: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
};

export async function getUserStats(): Promise<UserStats> {
  // Dates are passed as ISO strings — postgres-js rejects raw Date objects
  // when they're interpolated as bind parameters inside an aggregate filter,
  // even though the column itself is a timestamp.
  const now = Date.now();
  const d7 = new Date(now - 7 * 86_400_000).toISOString();
  const d30 = new Date(now - 30 * 86_400_000).toISOString();

  const [totals] = await db
    .select({
      total: count(),
      banned: sql<number>`count(*) filter (where ${user.banned} = true)`.mapWith(Number),
      admins: sql<number>`count(*) filter (where ${user.role} = 'admin')`.mapWith(Number),
      signupsLast7Days: sql<number>`count(*) filter (where ${user.createdAt} >= ${d7})`.mapWith(Number),
      signupsLast30Days: sql<number>`count(*) filter (where ${user.createdAt} >= ${d30})`.mapWith(Number),
    })
    .from(user);

  return {
    total: totals?.total ?? 0,
    banned: totals?.banned ?? 0,
    admins: totals?.admins ?? 0,
    signupsLast7Days: totals?.signupsLast7Days ?? 0,
    signupsLast30Days: totals?.signupsLast30Days ?? 0,
  };
}

export type GenerationStats = {
  total: number;
  last24h: number;
  last7Days: number;
  last30Days: number;
};

export async function getGenerationStats(): Promise<GenerationStats> {
  const now = Date.now();
  const d1 = new Date(now - 86_400_000).toISOString();
  const d7 = new Date(now - 7 * 86_400_000).toISOString();
  const d30 = new Date(now - 30 * 86_400_000).toISOString();

  const [row] = await db
    .select({
      total: count(),
      last24h: sql<number>`count(*) filter (where ${generation.createdAt} >= ${d1})`.mapWith(Number),
      last7Days: sql<number>`count(*) filter (where ${generation.createdAt} >= ${d7})`.mapWith(Number),
      last30Days: sql<number>`count(*) filter (where ${generation.createdAt} >= ${d30})`.mapWith(Number),
    })
    .from(generation);

  return {
    total: row?.total ?? 0,
    last24h: row?.last24h ?? 0,
    last7Days: row?.last7Days ?? 0,
    last30Days: row?.last30Days ?? 0,
  };
}

export type CreditStats = {
  totalBalance: number;
  totalPurchased: number;
  totalSpent: number;
  totalRefunded: number;
};

export async function getCreditStats(): Promise<CreditStats> {
  const [balanceRow] = await db
    .select({ total: sum(creditBalance.balance).mapWith(Number) })
    .from(creditBalance);

  const [txn] = await db
    .select({
      purchased: sql<number>`coalesce(sum(case when ${creditTransaction.type} = 'addition' then ${creditTransaction.amount} else 0 end), 0)`.mapWith(Number),
      spent: sql<number>`coalesce(-sum(case when ${creditTransaction.type} = 'deduction' then ${creditTransaction.amount} else 0 end), 0)`.mapWith(Number),
      refunded: sql<number>`coalesce(sum(case when ${creditTransaction.type} = 'refund' then ${creditTransaction.amount} else 0 end), 0)`.mapWith(Number),
    })
    .from(creditTransaction);

  return {
    totalBalance: balanceRow?.total ?? 0,
    totalPurchased: txn?.purchased ?? 0,
    totalSpent: txn?.spent ?? 0,
    totalRefunded: txn?.refunded ?? 0,
  };
}

export type TopUserRow = {
  userId: string;
  name: string;
  email: string;
  generations: number;
};

export async function getTopUsersByGenerations(opts?: {
  days?: number;
  limit?: number;
}): Promise<TopUserRow[]> {
  const days = opts?.days ?? 30;
  const limit = opts?.limit ?? 10;
  const since = new Date(Date.now() - days * 86_400_000);

  return await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      generations: count(generation.id).mapWith(Number),
    })
    .from(user)
    .leftJoin(generation, eq(generation.userId, user.id))
    .where(gte(generation.createdAt, since))
    .groupBy(user.id, user.name, user.email)
    .orderBy(desc(count(generation.id)))
    .limit(limit);
}

export type AuditEventRow = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  before: unknown;
  after: unknown;
  notes: string | null;
  createdAt: Date;
};

export async function getRecentAuditEvents(opts?: {
  limit?: number;
}): Promise<AuditEventRow[]> {
  const limit = opts?.limit ?? 10;
  return await db
    .select({
      id: adminAuditLog.id,
      actorId: adminAuditLog.actorId,
      actorName: user.name,
      actorEmail: user.email,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      before: adminAuditLog.before,
      after: adminAuditLog.after,
      notes: adminAuditLog.notes,
      createdAt: adminAuditLog.createdAt,
    })
    .from(adminAuditLog)
    .leftJoin(user, eq(user.id, adminAuditLog.actorId))
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(limit);
}

/* -------------------------------------------------------------------------- */
/*  Users                                                                       */
/* -------------------------------------------------------------------------- */

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  balance: number;
  generationCount: number;
};

export type ListUsersOpts = {
  search?: string;
  role?: "admin" | "user" | "all";
  banned?: "yes" | "no" | "all";
  page?: number;
  pageSize?: number;
};

const USERS_PAGE_SIZE = 25;

export async function listUsersForAdmin(
  opts: ListUsersOpts = {},
): Promise<{ rows: AdminUserRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? USERS_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  const filters: SQL[] = [];
  if (opts.search?.trim()) {
    const q = `%${opts.search.trim()}%`;
    const cond = or(ilike(user.name, q), ilike(user.email, q));
    if (cond) filters.push(cond);
  }
  if (opts.role === "admin") filters.push(eq(user.role, "admin"));
  if (opts.role === "user") {
    const cond = or(eq(user.role, "user"), sql`${user.role} is null`);
    if (cond) filters.push(cond);
  }
  if (opts.banned === "yes") filters.push(eq(user.banned, true));
  if (opts.banned === "no") {
    const cond = or(eq(user.banned, false), sql`${user.banned} is null`);
    if (cond) filters.push(cond);
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  // Build the generation-count subquery (per user) as a correlated count.
  // We materialise it as a single SQL fragment so we can join it once.
  const genCountSql = sql<number>`(SELECT COUNT(*)::int FROM ${generation} WHERE ${generation.userId} = ${user.id})`;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
      balance: creditBalance.balance,
      generationCount: genCountSql,
    })
    .from(user)
    .leftJoin(creditBalance, eq(creditBalance.userId, user.id))
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ value: total } = { value: 0 }] = await db
    .select({ value: count() })
    .from(user)
    .where(whereClause);

  return {
    rows: rows.map((r) => ({
      ...r,
      balance: r.balance ?? 0,
    })),
    total,
    page,
    pageSize,
  };
}

export type UserDetail = {
  profile: AdminUserRow;
  recentGenerations: Array<{
    id: string;
    prompt: string;
    modelId: string;
    aspectRatio: string;
    creditCost: number | null;
    imageUrl: string;
    createdAt: Date;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string | null;
    referenceId: string | null;
    createdAt: Date;
  }>;
  recentAudit: AuditEventRow[];
  activeSessionCount: number;
};

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
      balance: creditBalance.balance,
    })
    .from(user)
    .leftJoin(creditBalance, eq(creditBalance.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1);

  if (!profile) return null;

  const [{ value: generationCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(generation)
    .where(eq(generation.userId, userId));

  const recentGenerations = await db
    .select({
      id: generation.id,
      prompt: generation.prompt,
      modelId: generation.modelId,
      aspectRatio: generation.aspectRatio,
      creditCost: generation.creditCost,
      imageUrl: generation.imageUrl,
      createdAt: generation.createdAt,
    })
    .from(generation)
    .where(eq(generation.userId, userId))
    .orderBy(desc(generation.createdAt))
    .limit(20);

  const recentTransactions = await db
    .select({
      id: creditTransaction.id,
      amount: creditTransaction.amount,
      type: creditTransaction.type,
      description: creditTransaction.description,
      referenceId: creditTransaction.referenceId,
      createdAt: creditTransaction.createdAt,
    })
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId))
    .orderBy(desc(creditTransaction.createdAt))
    .limit(20);

  const recentAudit = await db
    .select({
      id: adminAuditLog.id,
      actorId: adminAuditLog.actorId,
      actorName: user.name,
      actorEmail: user.email,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      before: adminAuditLog.before,
      after: adminAuditLog.after,
      notes: adminAuditLog.notes,
      createdAt: adminAuditLog.createdAt,
    })
    .from(adminAuditLog)
    .leftJoin(user, eq(user.id, adminAuditLog.actorId))
    .where(
      and(eq(adminAuditLog.targetType, "user"), eq(adminAuditLog.targetId, userId)),
    )
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(20);

  const [{ value: activeSessionCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(sessionTable)
    .where(eq(sessionTable.userId, userId));

  return {
    profile: {
      ...profile,
      balance: profile.balance ?? 0,
      generationCount,
    },
    recentGenerations,
    recentTransactions,
    recentAudit,
    activeSessionCount,
  };
}

/* -------------------------------------------------------------------------- */
/*  Models                                                                      */
/* -------------------------------------------------------------------------- */

export type AdminModelRow = typeof modelTable.$inferSelect;

export async function listModelsForAdmin(): Promise<AdminModelRow[]> {
  return await db.select().from(modelTable).orderBy(asc(modelTable.sortOrder));
}

export async function countGenerationsForModel(modelId: string): Promise<number> {
  const [{ value } = { value: 0 }] = await db
    .select({ value: count() })
    .from(generation)
    .where(eq(generation.modelId, modelId));
  return value;
}

/* -------------------------------------------------------------------------- */
/*  Transactions                                                                */
/* -------------------------------------------------------------------------- */

export type AdminTransactionRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  amount: number;
  type: string;
  description: string | null;
  referenceId: string | null;
  createdAt: Date;
};

export type ListAllTransactionsOpts = {
  userId?: string;
  type?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
};

export async function listAllCreditTransactions(
  opts: ListAllTransactionsOpts = {},
): Promise<{
  rows: AdminTransactionRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  const filters: SQL[] = [];
  if (opts.userId) filters.push(eq(creditTransaction.userId, opts.userId));
  if (opts.type && opts.type !== "all")
    filters.push(eq(creditTransaction.type, opts.type));
  if (opts.from) filters.push(gte(creditTransaction.createdAt, opts.from));
  if (opts.to) filters.push(lte(creditTransaction.createdAt, opts.to));
  const whereClause = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: creditTransaction.id,
      userId: creditTransaction.userId,
      userName: user.name,
      userEmail: user.email,
      amount: creditTransaction.amount,
      type: creditTransaction.type,
      description: creditTransaction.description,
      referenceId: creditTransaction.referenceId,
      createdAt: creditTransaction.createdAt,
    })
    .from(creditTransaction)
    .leftJoin(user, eq(user.id, creditTransaction.userId))
    .where(whereClause)
    .orderBy(desc(creditTransaction.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ value: total } = { value: 0 }] = await db
    .select({ value: count() })
    .from(creditTransaction)
    .where(whereClause);

  return { rows, total, page, pageSize };
}

/* -------------------------------------------------------------------------- */
/*  Audit                                                                       */
/* -------------------------------------------------------------------------- */

export type ListAuditOpts = {
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
};

export async function listAuditLog(
  opts: ListAuditOpts = {},
): Promise<{ rows: AuditEventRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  const filters: SQL[] = [];
  if (opts.actorId) filters.push(eq(adminAuditLog.actorId, opts.actorId));
  if (opts.action && opts.action !== "all")
    filters.push(eq(adminAuditLog.action, opts.action));
  if (opts.targetType) filters.push(eq(adminAuditLog.targetType, opts.targetType));
  if (opts.targetId) filters.push(eq(adminAuditLog.targetId, opts.targetId));
  if (opts.from) filters.push(gte(adminAuditLog.createdAt, opts.from));
  if (opts.to) filters.push(lte(adminAuditLog.createdAt, opts.to));
  const whereClause = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: adminAuditLog.id,
      actorId: adminAuditLog.actorId,
      actorName: user.name,
      actorEmail: user.email,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      before: adminAuditLog.before,
      after: adminAuditLog.after,
      notes: adminAuditLog.notes,
      createdAt: adminAuditLog.createdAt,
    })
    .from(adminAuditLog)
    .leftJoin(user, eq(user.id, adminAuditLog.actorId))
    .where(whereClause)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ value: total } = { value: 0 }] = await db
    .select({ value: count() })
    .from(adminAuditLog)
    .where(whereClause);

  return { rows, total, page, pageSize };
}

/**
 * Hydrate a set of user ids → display info. Used by the audit log viewer to
 * render the "target user" column without a per-row query.
 */
export async function hydrateUsers(
  ids: string[],
): Promise<Map<string, { name: string; email: string }>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(inArray(user.id, ids));
  return new Map(rows.map((r) => [r.id, { name: r.name, email: r.email }] as const));
}
