"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeUserAction } from "@/app/admin/users/actions";
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

export function RemoveUserDialog({
  userId,
  userName,
  userEmail,
  open,
  onOpenChange,
  redirectAfter,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectAfter?: string;
}) {
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const canSubmit = confirm.trim().toLowerCase() === userEmail.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Type the user's email to confirm.");
      return;
    }
    startTransition(async () => {
      const res = await removeUserAction({ userId });
      if (res.success) {
        toast.success(`Removed ${userName}.`);
        onOpenChange(false);
        if (redirectAfter) router.replace(redirectAfter);
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
            Remove user
          </DialogTitle>
          <DialogDescription>
            This permanently deletes {userName} and cascades to their sessions,
            API keys, generations, and credit history. Type{" "}
            <strong>{userEmail}</strong> to confirm.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remove-confirm">Email</Label>
            <Input
              id="remove-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={userEmail}
              required
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
            <Button
              type="submit"
              variant="destructive"
              disabled={pending || !canSubmit}
            >
              {pending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
