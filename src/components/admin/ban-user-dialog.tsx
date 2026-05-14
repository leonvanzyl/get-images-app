"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { banUserAction, unbanUserAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BanUserDialog({
  userId,
  userName,
  isBanned,
  open,
  onOpenChange,
}: {
  userId: string;
  userName: string;
  isBanned: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length === 0) {
      toast.error("Reason is required.");
      return;
    }
    const expires = expiresIn.trim() ? Number(expiresIn.trim()) : undefined;
    if (expires !== undefined && (!Number.isFinite(expires) || expires <= 0)) {
      toast.error("Expires-in must be a positive number of seconds.");
      return;
    }
    startTransition(async () => {
      const res = await banUserAction({
        userId,
        banReason: reason.trim(),
        ...(expires !== undefined ? { banExpiresIn: expires } : {}),
      });
      if (res.success) {
        toast.success("User banned.");
        setReason("");
        setExpiresIn("");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleUnban = () => {
    startTransition(async () => {
      const res = await unbanUserAction({ userId });
      if (res.success) {
        toast.success("User unbanned.");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[20px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium tracking-tight">
            {isBanned ? "Unban user" : "Ban user"}
          </DialogTitle>
          <DialogDescription>
            {isBanned
              ? `Restore ${userName}'s access?`
              : `Ban ${userName} from signing in. Active sessions will be revoked.`}
          </DialogDescription>
        </DialogHeader>
        {isBanned ? (
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUnban} disabled={pending}>
              {pending ? "Unbanning…" : "Unban"}
            </Button>
          </DialogFooter>
        ) : (
          <form onSubmit={handleBan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason</Label>
              <Input
                id="ban-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Visible in the audit log."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-expires">Expires in (seconds, optional)</Label>
              <Input
                id="ban-expires"
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                placeholder="Leave blank for permanent."
                min="1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? "Banning…" : "Ban"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
