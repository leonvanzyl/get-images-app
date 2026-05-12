"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/auth-client"

const INPUT_CLASSES =
  "h-12 rounded-none border-border/60 bg-input px-3 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[2px]"

const LABEL_CLASSES =
  "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and a number")
      return
    }

    setIsPending(true)

    try {
      const result = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      })

      if (result.error) {
        setError(result.error.message || "Failed to create account")
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
        <Label htmlFor="name" className={LABEL_CLASSES}>
          Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          className={INPUT_CLASSES}
        />
      </div>
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
        <Label htmlFor="password" className={LABEL_CLASSES}>
          Password
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
          Confirm password
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
        {isPending ? "Creating account…" : "Create account"}
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
