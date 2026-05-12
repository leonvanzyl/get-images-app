import { Polar } from "@polar-sh/sdk"

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_ENVIRONMENT === "production" ? "production" : "sandbox",
})

export type CreditPack = {
  slug: string
  productId: string
  credits: number
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    slug: "starter",
    productId: process.env.POLAR_PRODUCT_ID_STARTER!,
    credits: 100,
  },
  {
    slug: "plus",
    productId: process.env.POLAR_PRODUCT_ID_PLUS!,
    credits: 500,
  },
  {
    slug: "pro",
    productId: process.env.POLAR_PRODUCT_ID_PRO!,
    credits: 1200,
  },
]

export function getProductCredits(productId: string): number | undefined {
  return CREDIT_PACKS.find((p) => p.productId === productId)?.credits
}
