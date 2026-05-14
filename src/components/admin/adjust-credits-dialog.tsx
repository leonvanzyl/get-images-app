"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adjustCreditsAction } from "@/app/admin/users/actions";
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
import { Textarea } from "@/components/ui/textarea";

export function AdjustCreditsDialog({
  userId,
  userName,
  currentBalance,
  open,
  onOpenChange,
}: {
  userId: string;
  userName: string;
  currentBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!Number.isFinite(num) || num === 0) {
      toast.error("Enter a non-zero number.");
      return;
    }
    if (reason.trim().length === 0) {
      toast.error("Reason is required.");
      return;
    }
    startTransition(async () => {
      const res = await adjustCreditsAction({
        userId,
        amount: Math.trunc(num),
        reason: reason.trim(),
      });
      if (res.success) {
        toast.success(`Adjusted. New balance: ${res.data?.balance ?? "?"}`);
        setAmount("");
        setReason("");
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
            Adjust credits
          </DialogTitle>
          <DialogDescription>
            For {userName}. Current balance: <strong>{currentBalance}</strong>.
            Use a negative number to subtract credits.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adjust-amount">Amount</Label>
            <Input
              id="adjust-amount"
              type="number"
              step="1"
              placeholder="e.g. 50 or -10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjust-reason">Reason</Label>
            <Textarea
              id="adjust-reason"
              placeholder="Why are you adjusting? Shown in the audit log."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
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
            <Button type="submit" disabled={pending}>
              {pending ? "Adjusting…" : "Adjust"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
