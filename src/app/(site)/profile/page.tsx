"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Bounce signed-out users back to the home page once we know the session
  // state for sure (avoids a flash of unauthenticated content).
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const user = session.user;
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const fallbackInitial = (
    user.name?.[0] ||
    user.email?.[0] ||
    "U"
  ).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="container mx-auto max-w-2xl px-6 py-16 md:py-24">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Your profile
        </h1>
        {user.name ? (
          <p className="text-sm text-muted-foreground">{user.name}</p>
        ) : null}
      </header>

      <section className="mt-10 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Avatar className="size-20">
            <AvatarImage
              src={user.image || ""}
              alt={user.name || "User"}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-xl">
              {fallbackInitial}
            </AvatarFallback>
          </Avatar>

          <p className="mt-5 font-display text-xl font-medium">
            {user.name || "Unnamed user"}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {user.email}
          </p>

          {user.emailVerified ? (
            <span className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Verified
            </span>
          ) : null}

          {createdDate ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Member since {createdDate}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Button asChild variant="outline" className="h-10 w-full rounded-[10px]">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="h-10 w-full rounded-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
