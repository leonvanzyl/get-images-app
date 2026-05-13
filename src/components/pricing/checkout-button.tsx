"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCheckout } from "@/app/(site)/pricing/actions";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  slug: string;
  label: string;
  recommended?: boolean;
}

/**
 * Pricing-page CTA. Wraps the shared `Button` so the visual treatment matches
 * the rest of the app — coral primary by default, subtle outline when the
 * card isn't the recommended one.
 */
export function CheckoutButton({
  slug,
  label,
  recommended,
}: CheckoutButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const result = await createCheckout(slug);
      if ("url" in result) {
        window.location.href = result.url;
      } else {
        toast.error(result.error);
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      variant={recommended ? "default" : "secondary"}
      onClick={handleCheckout}
      disabled={loading}
      className={cn("mt-2 w-full", loading && "cursor-wait")}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Processing
        </>
      ) : (
        label
      )}
    </Button>
  );
}
