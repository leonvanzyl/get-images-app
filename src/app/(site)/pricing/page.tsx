import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getAllModelPricing } from "@/services/credits";
import { IMAGE_MODELS } from "@/services/image-generation/models";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Get Images",
  description: "Credit packs and per-model pricing for AI image generation.",
};

/* ------------------------------------------------------------------ */
/*  Credit pack definitions                                            */
/* ------------------------------------------------------------------ */

const CREDIT_PACKS = [
  {
    name: "Starter",
    slug: "starter",
    credits: 100,
    price: 5.0,
    perCredit: 0.05,
    bonus: null,
    description: "Perfect for trying things out",
    features: [
      "~33 images with standard models",
      "~10 images with Pro models",
      "No expiry",
    ],
  },
  {
    name: "Plus",
    slug: "plus",
    credits: 500,
    price: 22.5,
    perCredit: 0.045,
    bonus: "10%",
    description: "For regular creators",
    features: [
      "~166 images with standard models",
      "~50 images with Pro models",
      "No expiry",
      "Best value per credit",
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    credits: 1200,
    price: 48.0,
    perCredit: 0.04,
    bonus: "20%",
    description: "For power users & teams",
    features: [
      "~400 images with standard models",
      "~120 images with Pro models",
      "No expiry",
      "Lowest cost per credit",
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function PricingPage() {
  const pricingRows = await getAllModelPricing();

  // Merge pricing data with display names from the model registry
  const models = pricingRows.map((row) => {
    const model = IMAGE_MODELS.find((m) => m.id === row.modelId);
    return {
      modelId: row.modelId,
      name: model?.name ?? row.modelId,
      creditCost: row.creditCost,
    };
  });

  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/*  Page header                                                */}
      {/* ---------------------------------------------------------- */}
      <section
        aria-labelledby="pricing-heading"
        className="border-b border-border/60 py-24 lg:py-32"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <header className="flex flex-col gap-4 border-l border-primary/40 pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              04 — Pricing
            </p>
            <h1
              id="pricing-heading"
              className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              Credits &amp; Pricing
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Every generation costs credits. Pick a pack that fits your
              production volume, load your reel, and start generating frames
              on demand.
            </p>
          </header>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Credit packs                                               */}
      {/* ---------------------------------------------------------- */}
      <section
        aria-labelledby="credit-packs-heading"
        className="border-b border-border/60 py-24 lg:py-32"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <header className="mb-12 flex flex-col gap-4 border-l border-primary/40 pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              01 — Credit Packs
            </p>
            <h2
              id="credit-packs-heading"
              className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              Load your reel.
            </h2>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {CREDIT_PACKS.map((pack, index) => {
              const isRecommended = index === 1;

              return (
                <div
                  key={pack.name}
                  className={cn(
                    "relative border bg-card/40",
                    isRecommended
                      ? "border-primary/60 glow-lime"
                      : "border-border/60",
                  )}
                >
                  {isRecommended && (
                    <span className="absolute -top-3 right-4 bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground">
                      Recommended
                    </span>
                  )}

                  {/* Header bar */}
                  <div className="flex items-center justify-between border-b border-border/60 px-5 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {pack.name}
                    </p>
                    {pack.bonus && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                        Save {pack.bonus}
                      </span>
                    )}
                  </div>

                  <div className="space-y-5 p-6">
                    {/* Price */}
                    <div>
                      <p className="font-display text-4xl font-semibold tracking-tight">
                        ${pack.price.toFixed(2)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        ${pack.perCredit.toFixed(3)} per credit
                      </p>
                    </div>

                    {/* Credits + description */}
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {pack.credits.toLocaleString()} credits
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pack.description}
                      </p>
                    </div>

                    <div aria-hidden="true" className="h-px bg-border" />

                    {/* Features */}
                    <ul className="space-y-3" role="list">
                      {pack.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <Check
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0 text-primary"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <CheckoutButton
                      slug={pack.slug}
                      label={`Buy ${pack.credits.toLocaleString()} credits`}
                      recommended={isRecommended}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Per-model cost table                                       */}
      {/* ---------------------------------------------------------- */}
      <section
        aria-labelledby="cost-per-model-heading"
        className="border-b border-border/60 py-24 lg:py-32"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <header className="mb-12 flex flex-col gap-4 border-l border-primary/40 pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              02 — Cost Per Model
            </p>
            <h2
              id="cost-per-model-heading"
              className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              Frames per pack.
            </h2>
          </header>

          <div className="overflow-x-auto border border-border/60 bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Model
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Credits / Image
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Starter (100)
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Plus (500)
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Pro (1,200)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow
                    key={model.modelId}
                    className="border-border/60 transition-colors [&>td:first-child]:border-l-2 [&>td:first-child]:border-transparent hover:[&>td:first-child]:border-primary"
                  >
                    <TableCell className="font-mono text-sm tabular-nums text-foreground">
                      {model.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {String(model.creditCost).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {String(
                        Math.floor(CREDIT_PACKS[0].credits / model.creditCost),
                      ).padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {String(
                        Math.floor(CREDIT_PACKS[1].credits / model.creditCost),
                      ).padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {String(
                        Math.floor(CREDIT_PACKS[2].credits / model.creditCost),
                      ).padStart(3, "0")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Note                                                       */}
      {/* ---------------------------------------------------------- */}
      <section aria-labelledby="pricing-note" className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="border border-border/60 bg-card/40 p-6">
            <p
              id="pricing-note"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
            >
              — Note —
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Credits are deducted per generation. Cost varies by model.
              1&nbsp;credit&nbsp;=&nbsp;$0.05.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
