import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"

export function GoogleSignInSection() {
  const hasGoogle =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET)
  if (!hasGoogle) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <GoogleSignInButton />
      <div
        className="relative flex items-center"
        role="separator"
        aria-label="or continue with email"
      >
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="px-3 text-xs text-muted-foreground">or</span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
