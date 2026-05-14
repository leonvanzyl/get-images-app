"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-session";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  adminAuditLog,
  creditBalance,
  creditTransaction,
  user,
} from "@/lib/schema";
import { getActorId, writeAuditLog } from "@/services/admin/audit";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  setRoleAction                                                              */
/* -------------------------------------------------------------------------- */

const setRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "user"]),
});

export async function setRoleAction(
  input: z.infer<typeof setRoleSchema>,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = setRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }
  const { userId, role } = parsed.data;

  if (userId === session.user.id) {
    return { success: false, error: "You can't change your own role." };
  }

  const [before] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!before) return { success: false, error: "User not found." };

  try {
    await auth.api.setRole({
      body: { userId, role },
      headers: await headers(),
    });
  } catch (err) {
    console.error("setRoleAction failed", err);
    return { success: false, error: "Could not change role." };
  }

  await writeAuditLog({
    actorId: getActorId(session),
    action: "user.set_role",
    targetType: "user",
    targetId: userId,
    before: { role: before.role },
    after: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*  banUserAction / unbanUserAction                                            */
/* -------------------------------------------------------------------------- */

const banSchema = z.object({
  userId: z.string().min(1),
  banReason: z.string().min(1).max(500),
  banExpiresIn: z.number().int().positive().optional(),
});

export async function banUserAction(
  input: z.infer<typeof banSchema>,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = banSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }
  const { userId, banReason, banExpiresIn } = parsed.data;

  if (userId === session.user.id) {
    return { success: false, error: "You can't ban yourself." };
  }

  try {
    await auth.api.banUser({
      body: {
        userId,
        banReason,
        ...(banExpiresIn !== undefined ? { banExpiresIn } : {}),
      },
      headers: await headers(),
    });
  } catch (err) {
    console.error("banUserAction failed", err);
    return { success: false, error: "Could not ban user." };
  }

  await writeAuditLog({
    actorId: getActorId(session),
    action: "user.ban",
    targetType: "user",
    targetId: userId,
    after: { banReason, banExpiresIn: banExpiresIn ?? null },
    notes: banReason,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function unbanUserAction(input: {
  userId: string;
}): Promise<ActionResult> {
  const session = await requireAdmin();
  const userId = input.userId;
  if (!userId) return { success: false, error: "Missing userId." };

  try {
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });
  } catch (err) {
    console.error("unbanUserAction failed", err);
    return { success: false, error: "Could not unban user." };
  }

  await writeAuditLog({
    actorId: getActorId(session),
    action: "user.unban",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*  removeUserAction                                                            */
/* -------------------------------------------------------------------------- */

export async function removeUserAction(input: {
  userId: string;
}): Promise<ActionResult> {
  const session = await requireAdmin();
  const userId = input.userId;
  if (!userId) return { success: false, error: "Missing userId." };
  if (userId === session.user.id) {
    return { success: false, error: "You can't remove yourself." };
  }

  const [target] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  try {
    await auth.api.removeUser({
      body: { userId },
      headers: await headers(),
    });
  } catch (err) {
    console.error("removeUserAction failed", err);
    return { success: false, error: "Could not remove user." };
  }

  await writeAuditLog({
    actorId: getActorId(session),
    action: "user.remove",
    targetType: "user",
    targetId: userId,
    before: target ?? null,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*  impersonateUserAction / stopImpersonatingAction                            */
/* -------------------------------------------------------------------------- */

export async function impersonateUserAction(input: {
  userId: string;
}): Promise<ActionResult> {
  const session = await requireAdmin();
  const userId = input.userId;
  if (!userId) return { success: false, error: "Missing userId." };
  if (userId === session.user.id) {
    return { success: false, error: "You can't impersonate yourself." };
  }

  try {
    await auth.api.impersonateUser({
      body: { userId },
      headers: await headers(),
    });
  } catch (err) {
    console.error("impersonateUserAction failed", err);
    return { success: false, error: "Could not start impersonation." };
  }

  await writeAuditLog({
    actorId: getActorId(session),
    action: "user.impersonate",
    targetType: "user",
    targetId: userId,
  });

  return { success: true };
}

export async function stopImpersonatingAction(): Promise<ActionResult> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) return { success: false, error: "Not signed in." };

  const impersonatedBy = (
    session.session as { impersonatedBy?: string | null } | undefined
  )?.impersonatedBy;
  if (!impersonatedBy) {
    return { success: false, error: "Not currently impersonating." };
  }
  const targetUserId = session.user.id;

  try {
    await auth.api.stopImpersonating({ headers: reqHeaders });
  } catch (err) {
    console.error("stopImpersonatingAction failed", err);
    return { success: false, error: "Could not stop impersonation." };
  }

  await writeAuditLog({
    actorId: impersonatedBy,
    action: "user.stop_impersonate",
    targetType: "user",
    targetId: targetUserId,
  });

  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*  adjustCreditsAction                                                         */
/* -------------------------------------------------------------------------- */

const adjustCreditsSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().refine((v) => v !== 0, "Amount must be non-zero."),
  reason: z.string().min(1).max(500),
});

export async function adjustCreditsAction(
  input: z.infer<typeof adjustCreditsSchema>,
): Promise<ActionResult<{ balance: number }>> {
  const session = await requireAdmin();
  const parsed = adjustCreditsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }
  const { userId, amount, reason } = parsed.data;
  const actorId = getActorId(session);

  try {
    const result = await db.transaction(async (tx) => {
      const rows = await tx.execute(
        sql`SELECT balance FROM credit_balance WHERE user_id = ${userId} FOR UPDATE`,
      );
      const prev = (rows[0] as { balance: number } | undefined)?.balance ?? 0;
      const next = prev + amount;
      if (next < 0) {
        throw new Error("Adjustment would result in a negative balance.");
      }

      await tx
        .insert(creditBalance)
        .values({ userId, balance: next })
        .onConflictDoUpdate({
          target: creditBalance.userId,
          set: { balance: next, updatedAt: new Date() },
        });

      await tx.insert(creditTransaction).values({
        userId,
        amount,
        type: "admin_adjustment",
        description: reason,
        referenceId: null,
      });

      await tx.insert(adminAuditLog).values({
        actorId,
        action: "user.adjust_credits",
        targetType: "user",
        targetId: userId,
        before: { balance: prev },
        after: { balance: next, delta: amount },
        notes: reason,
      });

      return { balance: next };
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/transactions");
    return { success: true, data: result };
  } catch (err) {
    console.error("adjustCreditsAction failed", err);
    const message =
      err instanceof Error ? err.message : "Could not adjust credits.";
    return { success: false, error: message };
  }
}
