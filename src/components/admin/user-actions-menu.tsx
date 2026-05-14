"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { impersonateUserAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdjustCreditsDialog } from "./adjust-credits-dialog";
import { BanUserDialog } from "./ban-user-dialog";
import { RemoveUserDialog } from "./remove-user-dialog";
import { SetRoleDialog } from "./set-role-dialog";

type Props = {
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: string;
  isBanned: boolean;
  currentBalance: number;
  isSelf: boolean;
};

export function UserActionsMenu({
  userId,
  userName,
  userEmail,
  currentRole,
  isBanned,
  currentBalance,
  isSelf,
}: Props) {
  const router = useRouter();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleImpersonate = () => {
    startTransition(async () => {
      const res = await impersonateUserAction({ userId });
      if (res.success) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="User actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${userId}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAdjustOpen(true)}>
            Adjust credits
          </DropdownMenuItem>
          {!isSelf ? (
            <>
              <DropdownMenuItem onClick={() => setRoleOpen(true)}>
                Set role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBanOpen(true)}>
                {isBanned ? "Unban" : "Ban"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImpersonate} disabled={pending}>
                {pending ? "Impersonating…" : "Impersonate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setRemoveOpen(true)}
                variant="destructive"
              >
                Remove
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AdjustCreditsDialog
        userId={userId}
        userName={userName}
        currentBalance={currentBalance}
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
      />
      <SetRoleDialog
        userId={userId}
        userName={userName}
        currentRole={currentRole}
        open={roleOpen}
        onOpenChange={setRoleOpen}
      />
      <BanUserDialog
        userId={userId}
        userName={userName}
        isBanned={isBanned}
        open={banOpen}
        onOpenChange={setBanOpen}
      />
      <RemoveUserDialog
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        redirectAfter="/admin/users"
      />
    </>
  );
}
