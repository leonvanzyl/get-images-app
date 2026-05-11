"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, useSession } from "@/lib/auth-client"

const INPUT_CLASSES =
  "h-12 rounded-none border-border/60 bg-input px-3 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[2px]"

const LABEL_CLASSES =
  "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"

export function SignInButton() {
  const { data: session, isPending: sessionPending } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  if (sessionPending) {
    return (
      <Button
        disabled
        className="h-12 w-full rounded-none font-mono text-[11px] uppercase tracking-[0.18em]"
      >
        Loading…
      </Button>
    )
  }

  if (session) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsPending(true)

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      })

      if (result.error) {
        setError(result.error.message || "Failed to sign in")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className={LABEL_CLASSES}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          className={INPUT_CLASSES}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className={LABEL_CLASSES}>
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Forgot?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
          className={INPUT_CLASSES}
        />
      </div>

      {error && (
        <p className="font-mono text-xs uppercase tracking-wide text-destructive">
          <span aria-hidden="true" className="mr-2">
            !
          </span>
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="group glow-lime h-12 w-full rounded-none font-mono text-[11px] uppercase tracking-[0.22em]"
      >
        {isPending ? "Signing in…" : "Sign in"}
        <span
          aria-hidden="true"
          className="ml-1 transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </Button>
    </form>
  )
}
