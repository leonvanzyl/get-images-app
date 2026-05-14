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
import {
  loadActiveModels,
  loadAllPricing,
} from "@/services/image-generation/model-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Get Images",
  description: "Credit packs and per-model pricing for AI image generation.",
};

/* ------------------------------------------------------------------ */
/*  Credit pack definitions                                            */
/* ------------------------------------------------------------------ */

type CreditPack = {
  name: string;
  slug: string;
  credits: number;
  price: number;
  description: string;
  features: string[];
};

const CREDIT_PACKS: CreditPack[] = [
  {
    name: "Starter",
    slug: "starter",
    credits: 100,
    price: 5.0,
    description: "Perfect for trying things out.",
    features: [
      "100 credits — no expiry",
      "Use any image model",
      "Friendly support over email",
    ],
  },
  {
    name: "Plus",
    slug: "plus",
    credits: 500,
    price: 22.5,
    description: "For regular creators.",
    features: [
      "500 credits — no expiry",
      "Use any image model",
      "Better value per credit",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    credits: 1200,
    price: 48.0,
    description: "For power users and teams.",
    features: [
      "1,200 credits — no expiry",
      "Use any image model",
      "Lowest cost per credit",
      "Priority support",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function PricingPage() {
  // Pull active models + their pricing in one shot. Both functions read from
  // the same `model` table and are wrapped in React.cache, so this is a
  // single DB round-trip per request.
  const [activeModels, pricingRows] = await Promise.all([
    loadActiveModels(),
    loadAllPricing(),
  ]);
  const pricingById = new Map(pricingRows.map((p) => [p.modelId, p]));
  const models = activeModels
    .map((m) => {
      const price = pricingById.get(m.id);
      if (!price) return null;
      return {
        modelId: m.id,
        name: m.name,
        creditCost: price.creditCost,
        thinkingHighCreditCost: price.thinkingHighCreditCost,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  // The "Deep thinking" column only renders when at least one model has a
  // thinking-high cost configured — otherwise the column is dead weight.
  const showThinkingColumn = models.some(
    (m) => m.thinkingHighCreditCost != null,
  );

  return (
    <div className="container mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-28">
      {/* -------------------------------------------------------------- */}
      {/*  Page header                                                    */}
      {/* -------------------------------------------------------------- */}
      <header className="mx-auto max-w-2xl space-y-3 text-center">
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
          Pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Pay as you go. No subscriptions.
        </p>
      </header>

      {/* -------------------------------------------------------------- */}
      {/*  Credit packs                                                   */}
      {/* -------------------------------------------------------------- */}
      <section
        aria-label="Credit packs"
        className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {CREDIT_PACKS.map((pack, index) => {
          const isPopular = index === 1;

          return (
            <div
              key={pack.slug}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-all",
                isPopular && "ring-2 ring-primary md:-translate-y-1",
              )}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Popular
                </span>
              )}

              <h2 className="font-display text-2xl font-medium tracking-tight">
                {pack.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {pack.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-medium tracking-tight">
                  ${pack.price.toFixed(pack.price % 1 === 0 ? 0 : 2)}
                </span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-mono text-foreground">
                  {pack.credits.toLocaleString()}
                </span>{" "}
                credits
              </p>

              <ul className="mt-6 space-y-3" role="list">
                {pack.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-foreground/90"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <CheckoutButton
                  slug={pack.slug}
                  label={`Get ${pack.name}`}
                  recommended={isPopular}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* -------------------------------------------------------------- */}
      {/*  Per-model pricing                                              */}
      {/* -------------------------------------------------------------- */}
      <section aria-labelledby="per-model-heading" className="mt-20 space-y-4">
        <header className="space-y-2">
          <h2
            id="per-model-heading"
            className="font-display text-2xl font-medium tracking-tight md:text-3xl"
          >
            Per-model pricing
          </h2>
          <p className="text-muted-foreground">
            Each image costs a few credits, depending on the model. Deep
            thinking costs a bit more when supported.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Model
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Default
                </TableHead>
                {showThinkingColumn && (
                  <TableHead className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Deep thinking
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.modelId}>
                  <TableCell className="px-4 py-3.5 text-sm font-medium text-foreground">
                    {model.name}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right text-sm text-foreground">
                    <span className="font-mono">{model.creditCost}</span>{" "}
                    <span className="text-muted-foreground">credits</span>
                  </TableCell>
                  {showThinkingColumn && (
                    <TableCell className="px-4 py-3.5 text-right text-sm text-foreground">
                      {model.thinkingHighCreditCost != null ? (
                        <>
                          <span className="font-mono">
                            {model.thinkingHighCreditCost}
                          </span>{" "}
                          <span className="text-muted-foreground">credits</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*  Images per pack                                              */}
        {/* ------------------------------------------------------------ */}
        <div className="mt-10 space-y-3">
          <header className="space-y-1">
            <h3 className="font-display text-lg font-medium">
              How many images per pack?
            </h3>
            <p className="text-sm text-muted-foreground">
              At the default credit cost — deep thinking will use a few more.
            </p>
          </header>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    Model
                  </TableHead>
                  {CREDIT_PACKS.map((pack) => (
                    <TableHead
                      key={pack.slug}
                      className="px-4 py-3 text-right text-xs font-medium text-muted-foreground"
                    >
                      {pack.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.modelId}>
                    <TableCell className="px-4 py-3.5 text-sm font-medium text-foreground">
                      {model.name}
                    </TableCell>
                    {CREDIT_PACKS.map((pack) => (
                      <TableCell
                        key={pack.slug}
                        className="px-4 py-3.5 text-right text-sm text-foreground"
                      >
                        <span className="font-mono">
                          {Math.floor(pack.credits / model.creditCost)}
                        </span>{" "}
                        <span className="text-muted-foreground">images</span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="pt-2 text-xs text-muted-foreground">
          1 credit ≈ $0.04 – $0.05 depending on pack.
        </p>
      </section>
    </div>
  );
}
