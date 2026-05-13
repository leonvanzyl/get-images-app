import Link from "next/link"

/**
 * Calm, centered shell for sign-in, sign-up and recovery pages.
 * A single soft coral wash sits behind the form; the content lives in a
 * narrow column so the form is the entire focus of the screen.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="hero-glow flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full bg-primary"
            />
            <span className="font-display text-lg font-medium tracking-tight">
              get images
            </span>
          </Link>
        </div>

        {children}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link
            href="#"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
