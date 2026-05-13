"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/lib/auth-client"

const INPUT_CLASSES = "h-10 rounded-[10px]"

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
      <div
        role="status"
        className="rounded-2xl border bg-card p-6 text-center shadow-sm"
      >
        <p className="font-display text-lg font-medium">Check your inbox.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for that address, we&apos;ve sent a one-time
          reset link.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
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
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full rounded-[10px]"
      >
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  )
}
