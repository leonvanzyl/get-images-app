"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { CREDIT_PACKS, polarClient } from "@/lib/polar"

async function ensureCustomer(userId: string, email: string, name: string) {
  try {
    return await polarClient.customers.getExternal({ externalId: userId })
  } catch {
    // Not found by externalId — try by email or create
  }

  const { result: existing } = await polarClient.customers.list({ email })
  if (existing.items[0]) {
    return await polarClient.customers.update({
      id: existing.items[0].id,
      customerUpdate: { externalId: userId },
    })
  }

  return await polarClient.customers.create({ email, name, externalId: userId })
}

export async function createCheckout(
  slug: string,
): Promise<{ url: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { error: "Not authenticated" }
  }

  const pack = CREDIT_PACKS.find((p) => p.slug === slug)
  if (!pack) {
    return { error: "Unknown product" }
  }

  const { id: userId, email, name } = session.user

  try {
    await ensureCustomer(userId, email, name)
  } catch (e) {
    console.error("Failed to ensure Polar customer:", e)
  }

  const baseURL =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"

  try {
    const checkout = await polarClient.checkouts.create({
      products: [pack.productId],
      externalCustomerId: userId,
      customerEmail: email,
      customerName: name,
      successUrl: new URL("/dashboard", baseURL).toString(),
      allowDiscountCodes: true,
    })

    return { url: checkout.url }
  } catch (e) {
    console.error("Polar checkout creation failed:", e)
    return { error: "Failed to create checkout" }
  }
}
