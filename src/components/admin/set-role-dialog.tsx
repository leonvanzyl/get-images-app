"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setRoleAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function SetRoleDialog({
  userId,
  userName,
  currentRole,
  open,
  onOpenChange,
}: {
  userId: string;
  userName: string;
  currentRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = useState<"admin" | "user">(
    currentRole === "admin" ? "admin" : "user",
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await setRoleAction({ userId, role });
      if (res.success) {
        toast.success(`Role set to ${role}.`);
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
            Change role
          </DialogTitle>
          <DialogDescription>For {userName}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              {(["user", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={
                    role === r
                      ? "rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm text-primary"
                      : "rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }
                >
                  {r === "admin" ? "Admin" : "User"}
                </button>
              ))}
            </div>
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
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
