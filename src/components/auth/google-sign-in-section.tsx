import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"

export function GoogleSignInSection() {
  const hasGoogle =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET)
  if (!hasGoogle) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <GoogleSignInButton />
      <div
        className="relative flex items-center"
        role="separator"
        aria-label="Or continue with email"
      >
        <span aria-hidden="true" className="h-px flex-1 bg-border/60" />
        <span className="px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Or with email
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border/60" />
      </div>
    </div>
  )
}
