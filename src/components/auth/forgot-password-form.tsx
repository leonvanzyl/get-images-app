"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/lib/auth-client"

const INPUT_CLASSES =
  "h-12 rounded-none border-border/60 bg-input px-3 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[2px]"

const LABEL_CLASSES =
  "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsPending(true)

    try {
      const result = await requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      })

      if (result.error) {
        setError(result.error.message || "Failed to send reset email")
      } else {
        setSuccess(true)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  if (success) {
    return (
      <div className="w-full space-y-6">
        <div className="border border-primary/30 bg-primary/5 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            <span className="mr-2">✓</span>Reset link dispatched
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            If an account exists for that address, we&apos;ve sent a one-time
            link. Check your inbox (and your terminal in development).
          </p>
        </div>
        <Link href="/login" className="block">
          <Button
            variant="outline"
            className="h-12 w-full rounded-none border-border/60 font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            Back to sign in
          </Button>
        </Link>
      </div>
    )
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
        {isPending ? "Sending…" : "Send reset link"}
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
