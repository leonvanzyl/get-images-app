import { Resend } from "resend";

// Resend client is constructed lazily so `next build` does not crash when
// RESEND_API_KEY is unavailable at build time (e.g. CI without secrets).
let client: Resend | undefined;

export function getResendClient(): Resend {
  if (client) {
    return client;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  client = new Resend(apiKey);
  return client;
}
