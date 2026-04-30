import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { Separator } from "@/components/ui/separator"

export function GoogleSignInSection() {
  const hasGoogle =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET)
  if (!hasGoogle) {
    return null
  }

  return (
    <div className="mb-6 flex w-full max-w-sm flex-col gap-6">
      <GoogleSignInButton />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  )
}
