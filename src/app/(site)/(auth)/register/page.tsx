import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { GoogleSignInSection } from "@/components/auth/google-sign-in-section"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { auth } from "@/lib/auth"

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Free credits to get you started. No card needed.
        </p>
      </header>

      <GoogleSignInSection />

      <SignUpForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Sign in →
        </Link>
      </p>
    </div>
  )
}
