import { apiKey } from "@better-auth/api-key";
import { polar, checkout, webhooks } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { addCredits } from "@/services/credits";
import { db } from "./db";
import { CREDIT_PACKS, getProductCredits, polarClient } from "./polar";

const baseURL =
  process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL,
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // TODO: When upgrading Better Auth past v1.6.11, replace this with the
    // `password.validate` hook so the server enforces the same upper/lower/digit
    // rule the client forms apply. v1.6.11 only exposes minPasswordLength here,
    // so complexity is currently enforced client-side only (sign-up-form.tsx
    // and reset-password-form.tsx).
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      if (
        process.env.NODE_ENV === "development" &&
        process.env.DEBUG_AUTH_LINKS === "1"
      ) {
        console.warn(
          `\n${"=".repeat(60)}\nPASSWORD RESET REQUEST\nUser: ${user.email}\nReset URL: ${url}\n${"=".repeat(60)}\n`
        );
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (
        process.env.NODE_ENV === "development" &&
        process.env.DEBUG_AUTH_LINKS === "1"
      ) {
        console.warn(
          `\n${"=".repeat(60)}\nEMAIL VERIFICATION\nUser: ${user.email}\nVerification URL: ${url}\n${"=".repeat(60)}\n`
        );
      }
    },
  },
  plugins: [
    apiKey({
      apiKeyHeaders: ["x-api-key", "authorization"],
      rateLimit: {
        enabled: true,
        timeWindow: 60_000,
        maxRequests: 60,
      },
      defaultPrefix: "gi_live_",
      maximumNameLength: 64,
      startingCharactersConfig: {
        shouldStore: true,
        charactersLength: 12,
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: CREDIT_PACKS.map((p) => ({ productId: p.productId, slug: p.slug })),
          successUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onOrderPaid: async (payload) => {
            const userId = payload.data.customer.externalId;
            if (!userId) {
              console.error("Polar webhook: missing externalId on customer");
              return;
            }
            const productId = payload.data.product?.id;
            if (!productId) {
              console.error("Polar webhook: missing product on order");
              return;
            }
            const credits = getProductCredits(productId);
            if (!credits) {
              console.error(`Polar webhook: unknown product ${productId}`);
              return;
            }
            const orderId = payload.data.id;
            await addCredits(
              userId,
              credits,
              `Purchased ${credits} credits (Order ${orderId})`,
              orderId
            );
          },
        }),
      ],
    }),
  ],
});
