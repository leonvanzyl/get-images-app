import { db } from "@/lib/db";
import { adminAuditLog } from "@/lib/schema";

export type AdminAuditAction =
  | "user.set_role"
  | "user.ban"
  | "user.unban"
  | "user.remove"
  | "user.impersonate"
  | "user.stop_impersonate"
  | "user.adjust_credits"
  | "model.create"
  | "model.update"
  | "model.delete"
  | "model.toggle_active";

type SessionLike = {
  user?: { id?: string | null } | null;
  session?: { impersonatedBy?: string | null | undefined } | null | undefined;
};

/**
 * Resolve the "real" actor id for an audit row. While an admin is
 * impersonating another user, `session.user.id` points at the *target* — the
 * admin's own id lives on `session.session.impersonatedBy`. Recording the
 * impersonator is how we keep the audit log honest.
 */
export function getActorId(session: SessionLike): string {
  const impersonator = session.session?.impersonatedBy;
  if (impersonator) return impersonator;
  if (!session.user?.id) {
    throw new Error("Cannot derive actor id from session without a user.");
  }
  return session.user.id;
}

export type WriteAuditLogInput = {
  actorId: string;
  action: AdminAuditAction;
  targetType: "user" | "model" | "credit_balance" | null;
  targetId: string | null;
  before?: unknown;
  after?: unknown;
  notes?: string | null;
};

/**
 * Write a single audit log row. Non-credit business actions call this in
 * "best-effort" mode — failures are logged and swallowed so a failed audit
 * write never blocks the underlying mutation. The credit-adjustment path is
 * the exception: it composes the audit insert inside the same transaction
 * as the balance change.
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    await db.insert(adminAuditLog).values({
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      before: (input.before ?? null) as never,
      after: (input.after ?? null) as never,
      notes: input.notes ?? null,
    });
  } catch (err) {
    console.error(
      `writeAuditLog failed for action=${input.action} target=${input.targetType}:${input.targetId}`,
      err,
    );
  }
}
