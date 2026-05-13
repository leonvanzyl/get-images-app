import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { GoogleSignInSection } from "@/components/auth/google-sign-in-section"
import { SignInButton } from "@/components/auth/sign-in-button"
import { auth } from "@/lib/auth"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect("/dashboard")
  }

  const { reset } = await searchParams

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to keep generating.
        </p>
      </header>

      {reset === "success" && (
        <p
          role="status"
          className="rounded-[10px] border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-primary"
        >
          Password updated. Sign in with your new password.
        </p>
      )}

      <GoogleSignInSection />

      <SignInButton />

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Create one →
        </Link>
      </p>
    </div>
  )
}
