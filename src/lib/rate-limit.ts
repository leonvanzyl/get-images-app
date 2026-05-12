type RateLimiterOptions = {
  windowMs: number;
  max: number;
};

type CheckResult = {
  success: boolean;
  remaining: number;
};

const CLEANUP_INTERVAL_MS = 60_000;

export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max } = options;
  const hits = new Map<string, number[]>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, valid);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node.js process to exit without waiting for this timer
  if (typeof cleanup === "object" && "unref" in cleanup) {
    cleanup.unref();
  }

  function check(key: string): CheckResult {
    const now = Date.now();
    const timestamps = hits.get(key) ?? [];
    const valid = timestamps.filter((t) => now - t < windowMs);

    if (valid.length >= max) {
      hits.set(key, valid);
      return { success: false, remaining: 0 };
    }

    valid.push(now);
    hits.set(key, valid);
    return { success: true, remaining: max - valid.length };
  }

  return { check };
}
