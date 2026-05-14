/**
 * Next.js instrumentation hook. Runs once per server boot on the Node.js
 * runtime — used here to validate environment variables and refuse to start
 * with the previously-leaked BETTER_AUTH_SECRET value from env.example.
 *
 * Guarded on NEXT_RUNTIME so the validation doesn't run in the Edge bundle.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkEnv } = await import("@/lib/env");
    checkEnv();
  }
}
