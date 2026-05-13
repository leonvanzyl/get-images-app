import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { auth } from "@/lib/auth"

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Forgot your password?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tell us your email and we&apos;ll send a reset link.
        </p>
      </header>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Back to sign in →
        </Link>
      </p>
    </div>
  )
}
