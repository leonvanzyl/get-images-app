"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createCheckout } from "@/app/(site)/pricing/actions"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

interface CheckoutButtonProps {
  slug: string
  label: string
  recommended?: boolean
}

export function CheckoutButton({ slug, label, recommended }: CheckoutButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (!session) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const result = await createCheckout(slug)
      if ("url" in result) {
        window.location.href = result.url
      } else {
        toast.error(result.error)
        setLoading(false)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={cn(
        "mt-2 w-full border py-2.5 font-mono text-xs uppercase tracking-[0.18em] transition-colors",
        recommended
          ? "glow-lime border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border/60 text-foreground hover:border-primary hover:text-primary",
        loading && "cursor-wait opacity-70",
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-3 animate-spin" />
          Processing
        </span>
      ) : (
        <>{label} &rarr;</>
      )}
    </button>
  )
}
