"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/auth-client"

const INPUT_CLASSES =
  "h-12 rounded-none border-border/60 bg-input px-3 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[2px]"

const LABEL_CLASSES =
  "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const error = searchParams.get("error")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState("")
  const [isPending, setIsPending] = useState(false)

  if (error === "invalid_token" || !token) {
    return (
      <div className="w-full space-y-6">
        <div className="border border-destructive/40 bg-destructive/5 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
            <span className="mr-2">!</span>Link invalid
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {error === "invalid_token"
              ? "This password reset link is invalid or has expired."
              : "No reset token was provided in the URL."}
          </p>
        </div>
        <Link href="/forgot-password" className="block">
          <Button
            variant="outline"
            className="h-12 w-full rounded-none border-border/60 font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            Request a new link
          </Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters")
      return
    }

    setIsPending(true)

    try {
      const result = await resetPassword({
        newPassword: password,
        token,
      })

      if (result.error) {
        setFormError(result.error.message || "Failed to reset password")
      } else {
        router.push("/login?reset=success")
      }
    } catch {
      setFormError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className={LABEL_CLASSES}>
          New password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
          className={INPUT_CLASSES}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className={LABEL_CLASSES}>
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Type it again"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isPending}
          className={INPUT_CLASSES}
        />
      </div>

      {formError && (
        <p className="font-mono text-xs uppercase tracking-wide text-destructive">
          <span aria-hidden="true" className="mr-2">
            !
          </span>
          {formError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="group glow-lime h-12 w-full rounded-none font-mono text-[11px] uppercase tracking-[0.22em]"
      >
        {isPending ? "Updating…" : "Update password"}
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
