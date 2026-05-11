import { Suspense } from "react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { auth } from "@/lib/auth"

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span
            aria-hidden="true"
            className="inline-block size-2 rounded-full bg-primary animate-cursor-blink shadow-[0_0_8px_oklch(0.9_0.22_130/0.6)]"
          />
          ● Get Images
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span className="text-foreground/70">Account recovery</span>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          Recovery — New password
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Set a new password.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Pick something strong. We&apos;ll sign you in right after.
        </p>

        <div className="mt-10">
          <Suspense
            fallback={
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Loading reset form…
              </p>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Don&apos;t need this?{" "}
          <Link
            href="/login"
            className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Back to sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
