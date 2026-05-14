import type React from "react";
import { render } from "@react-email/render";
import { getResendClient } from "./client";

const DEFAULT_FROM = "Get Images <noreply@getimages.dev>";
const RETRY_DELAY_MS = 250;

type SendEmailArgs = {
  to: string;
  subject: string;
  react: React.ReactElement;
};

type ResendErrorLike = {
  statusCode?: number | null;
  name?: string;
  message?: string;
};

function isTransientError(error: unknown): boolean {
  // Network errors (fetch failed, abort, DNS) surface as Error without a
  // statusCode — retry those. For Resend API errors we only retry 5xx.
  if (error instanceof Error && !("statusCode" in error)) {
    return true;
  }

  if (error && typeof error === "object") {
    const err = error as ResendErrorLike;
    if (err.statusCode == null) {
      return true;
    }
    return err.statusCode >= 500 && err.statusCode < 600;
  }

  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail(args: SendEmailArgs): Promise<void> {
  const { to, subject, react } = args;
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ]);

  const payload = { from, to, subject, html, text };

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await getResendClient().emails.send(payload);

      // Resend returns { data, error } — surface the error so we can retry it.
      if (result.error) {
        lastError = result.error;
        if (attempt === 0 && isTransientError(result.error)) {
          await delay(RETRY_DELAY_MS);
          continue;
        }
        break;
      }

      return;
    } catch (err) {
      lastError = err;
      if (attempt === 0 && isTransientError(err)) {
        await delay(RETRY_DELAY_MS);
        continue;
      }
      break;
    }
  }

  console.error("[email] send failed", { to, subject, err: lastError });
  throw lastError instanceof Error
    ? lastError
    : new Error(
        `Failed to send email: ${
          (lastError as ResendErrorLike)?.message ?? "unknown error"
        }`,
      );
}
