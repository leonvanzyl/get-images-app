"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Calendar,
  User,
  Shield,
  ArrowLeft,
  Lock,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const INPUT_CLASSES =
  "h-12 rounded-none border-border/60 bg-input px-3 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[2px]";

const LABEL_CLASSES =
  "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground";

const EYEBROW_CLASSES =
  "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground";

const SECTION_CLASSES =
  "border border-border/60 bg-card/40 rounded-none p-6 md:p-8";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [emailPrefsOpen, setEmailPrefsOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Loading…
        </p>
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

  const firstName = user.name?.trim().split(/\s+/)[0];
  const avatarInitial = (
    user.name?.[0] ||
    user.email?.[0] ||
    "U"
  ).toUpperCase();
  const isOAuth = Boolean(user.email?.includes("@gmail"));

  const handleEditProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user profile
    toast.info("Profile updates require backend implementation");
    setEditProfileOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-6 md:p-8">
      {/* Top bar — back + frame marker */}
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-9 rounded-none px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span
            aria-hidden="true"
            className="inline-block size-2 rounded-full bg-primary shadow-[0_0_6px_oklch(0.9_0.22_130/0.6)]"
          />
          Get Images
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span className="text-foreground/70">Profile</span>
        </div>
      </div>

      {/* Hero — eyebrow + display title + identity plate */}
      <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-4">
          <p className={EYEBROW_CLASSES}>Profile — Account</p>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
            {firstName ? `Hello, ${firstName}.` : "Your account."}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Your identity, session status, and account preferences in one place.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative size-20 shrink-0 overflow-hidden border border-border/60 bg-card transition-colors hover:border-primary/70">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "User"}
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center font-display text-2xl text-foreground">
                {avatarInitial}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-xl text-foreground">
              {user.name || "Unnamed user"}
            </p>
            <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted-foreground">
              <Mail className="size-3.5" />
              {user.email}
            </p>
            {user.emailVerified && (
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                <span aria-hidden="true">●</span> Verified
              </p>
            )}
            {createdDate && (
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
                <Calendar className="size-3" />
                Member since {createdDate}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Account information */}
      <section className={cn("mt-12", SECTION_CLASSES)}>
        <header className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
          <p className={EYEBROW_CLASSES}>Profile — Information</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
            01 / 03
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2 border-l border-border/60 pl-4">
            <p className={LABEL_CLASSES}>Full name</p>
            <p className="text-lg text-foreground">
              {user.name || (
                <span className="text-muted-foreground/60">Not provided</span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 border-l border-border/60 pl-4">
            <p className={LABEL_CLASSES}>Email address</p>
            <p className="flex flex-wrap items-center gap-3 text-lg text-foreground">
              <span className="break-all">{user.email}</span>
              {user.emailVerified && (
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  <span aria-hidden="true">●</span> Verified
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-8">
          <p className={cn(EYEBROW_CLASSES, "mb-4")}>Account status</p>
          <div className="grid grid-cols-1 gap-px bg-border/60 md:grid-cols-2">
            <div className="flex items-start justify-between gap-4 bg-card p-5">
              <div className="flex flex-col gap-1">
                <p className={LABEL_CLASSES}>Email verification</p>
                <p className="text-sm text-foreground">
                  Email address verification status
                </p>
              </div>
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.22em]",
                  user.emailVerified
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <span aria-hidden="true">●</span>{" "}
                {user.emailVerified ? "Verified" : "Unverified"}
              </p>
            </div>
            <div className="flex items-start justify-between gap-4 bg-card p-5">
              <div className="flex flex-col gap-1">
                <p className={LABEL_CLASSES}>Account type</p>
                <p className="text-sm text-foreground">
                  Your account access level
                </p>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80">
                <span aria-hidden="true">●</span> Standard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className={cn("mt-8", SECTION_CLASSES)}>
        <header className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
          <p className={EYEBROW_CLASSES}>Profile — Activity</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
            02 / 03
          </p>
        </header>

        <div className="flex items-center justify-between gap-4 border border-border/60 p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)] animate-cursor-blink"
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">
                Current session
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Active now
              </p>
            </div>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            <span aria-hidden="true">●</span> Active
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section className={cn("mt-8", SECTION_CLASSES)}>
        <header className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
          <p className={EYEBROW_CLASSES}>Profile — Quick actions</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
            03 / 03
          </p>
        </header>

        <div className="grid grid-cols-1 gap-px bg-border/60 md:grid-cols-3">
          <QuickActionTile
            icon={<User className="size-4" />}
            title="Edit profile"
            subtitle="Update your information"
            onClick={() => setEditProfileOpen(true)}
          />
          <QuickActionTile
            icon={<Shield className="size-4" />}
            title="Security settings"
            subtitle="Manage security options"
            onClick={() => setSecurityOpen(true)}
          />
          <QuickActionTile
            icon={<Mail className="size-4" />}
            title="Email preferences"
            subtitle="Configure notifications"
            onClick={() => setEmailPrefsOpen(true)}
          />
        </div>
      </section>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="gap-5 rounded-none border-border bg-card sm:max-w-[480px]">
          <DialogHeader>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Profile — Edit
            </p>
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
              Edit profile
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update your profile information. Changes will be saved to your
              account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProfileSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className={LABEL_CLASSES}>
                Full name
              </Label>
              <Input
                id="name"
                defaultValue={user.name || ""}
                placeholder="Enter your name"
                className={INPUT_CLASSES}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={LABEL_CLASSES}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email || ""}
                disabled
                className={cn(INPUT_CLASSES, "bg-muted/40")}
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                Email cannot be changed for OAuth accounts
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditProfileOpen(false)}
                className="rounded-none font-mono text-xs uppercase tracking-[0.18em]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="glow-lime rounded-none font-mono text-xs uppercase tracking-[0.18em]"
              >
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Security Settings Dialog */}
      <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
        <DialogContent className="gap-5 rounded-none border-border bg-card sm:max-w-[560px]">
          <DialogHeader>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Profile — Security
            </p>
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
              Security settings
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Manage your account security and authentication options.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <SecurityRow
              icon={<Lock className="size-4 text-muted-foreground" />}
              title="Password"
              description={
                isOAuth
                  ? "Managed by Google"
                  : "Set a password for your account"
              }
              status={isOAuth ? "OAuth" : "Not set"}
            />
            <SecurityRow
              icon={<Smartphone className="size-4 text-muted-foreground" />}
              title="Two-factor authentication"
              description="Add an extra layer of security"
              trailing={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="rounded-none font-mono text-[10px] uppercase tracking-[0.22em]"
                >
                  Coming soon
                </Button>
              }
            />
            <SecurityRow
              icon={<Shield className="size-4 text-muted-foreground" />}
              title="Active sessions"
              description="Manage devices logged into your account"
              status="1 Active"
              statusVariant="primary"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              onClick={() => setSecurityOpen(false)}
              className="rounded-none font-mono text-xs uppercase tracking-[0.18em]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preferences Dialog */}
      <Dialog open={emailPrefsOpen} onOpenChange={setEmailPrefsOpen}>
        <DialogContent className="gap-5 rounded-none border-border bg-card sm:max-w-[480px]">
          <DialogHeader>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Profile — Email
            </p>
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
              Email preferences
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Configure your email notification settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <SecurityRow
              title="Marketing emails"
              description="Product updates and announcements"
              status="Coming soon"
            />
            <SecurityRow
              title="Security alerts"
              description="Important security notifications"
              status="Always on"
              statusVariant="primary"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              onClick={() => setEmailPrefsOpen(false)}
              className="rounded-none font-mono text-xs uppercase tracking-[0.18em]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuickActionTile({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bracket-frame group relative flex flex-col items-start gap-3 border border-transparent bg-card p-5 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:border-primary"
    >
      <span className="text-muted-foreground transition-colors group-hover:text-primary">
        {icon}
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function SecurityRow({
  icon,
  title,
  description,
  status,
  statusVariant = "default",
  trailing,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  status?: string;
  statusVariant?: "default" | "primary";
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border border-border/60 p-4">
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5">{icon}</span> : null}
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {trailing ??
        (status ? (
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.22em]",
              statusVariant === "primary"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <span aria-hidden="true">●</span> {status}
          </p>
        ) : null)}
    </div>
  );
}
