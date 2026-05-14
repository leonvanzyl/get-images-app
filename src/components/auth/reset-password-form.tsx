"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/auth-client"

const INPUT_CLASSES = "h-10 rounded-[10px]"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const error = searchParams.get("error")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState("")
  const [isPending, setIsPending] = useState(false)

  // Token-missing / token-invalid is a hard error state — we replace the form
  // with a clear message and a path back to request a fresh link.
  if (error === "invalid_token" || !token) {
    return (
      <div className="w-full space-y-4">
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <p className="font-display text-lg font-medium text-destructive">
            Link invalid
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error === "invalid_token"
              ? "This password reset link is invalid or has expired."
              : "No reset token was provided in the URL."}
          </p>
        </div>
        <Link href="/forgot-password" className="block">
          <Button
            variant="outline"
            className="h-10 w-full rounded-[10px]"
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
      setFormError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.")
      return
    }

    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setFormError(
        "Include an uppercase letter, a lowercase letter, and a number."
      )
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
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
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

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
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
        <p role="alert" className="text-xs text-destructive">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full rounded-[10px]"
      >
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  )
}
