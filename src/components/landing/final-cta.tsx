import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading">
      <div className="container mx-auto max-w-4xl px-6 py-20 md:py-28">
        <div className="hero-glow rounded-[24px] border bg-card p-12 text-center shadow-sm md:p-16">
          <h2
            id="cta-heading"
            className="font-display text-4xl font-medium tracking-tight text-balance md:text-5xl"
          >
            Ready to make something?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with free credits. No card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
