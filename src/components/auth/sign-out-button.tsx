"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

export function SignOutButton() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <Button variant="ghost" disabled>
        Loading…
      </Button>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await signOut();
        router.replace("/");
        router.refresh();
      }}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
