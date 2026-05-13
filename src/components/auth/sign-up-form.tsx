"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/auth-client"

const INPUT_CLASSES = "h-10 rounded-[10px]"

type FieldErrors = {
  name?: string
  email?: string
  password?: string
}

/** Lightweight client-side validation matching the server-side requirements. */
function validate(name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}

  if (!name.trim()) {
    errors.name = "Please enter your name."
  }

  if (!email.trim()) {
    errors.email = "Please enter your email."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That doesn't look like a valid email."
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  } else if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    errors.password =
      "Include an uppercase letter, a lowercase letter, and a number."
  }

  return errors
}

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const errors = validate(name, email, password)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
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
        setFormError(result.error.message || "Failed to create account")
      } else {
        router.push("/dashboard")
        router.refresh()
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
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.name) || undefined}
          className={INPUT_CLASSES}
        />
        {fieldErrors.name && (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

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
          aria-invalid={Boolean(fieldErrors.email) || undefined}
          className={INPUT_CLASSES}
        />
        {fieldErrors.email && (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.password) || undefined}
          className={INPUT_CLASSES}
        />
        {fieldErrors.password && (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        )}
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
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}
