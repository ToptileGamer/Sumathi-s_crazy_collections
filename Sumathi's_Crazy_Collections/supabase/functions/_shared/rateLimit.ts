// supabase/functions/_shared/rateLimit.ts
// In-memory sliding-window rate limiter for Supabase Edge Functions.
//
// Usage:
//   import { rateLimit } from '../_shared/rateLimit.ts';
//
//   const rl = rateLimit('create-order', { maxRequests: 5, windowMs: 300_000 });
//   const key = user.id;               // or IP for unauthenticated endpoints
//   const result = rl.check(key);
//   if (!result.allowed) {
//     return new Response(JSON.stringify({ error: 'Too many requests' }), {
//       status: 429,
//       headers: { ...cors.headers, 'Content-Type': 'application/json', 'Retry-After': String(result.retryAfterSec) },
//     });
//   }
//
// The Map is automatically pruned every 60 s so it doesn't grow unbounded.

interface RateLimitEntry {
  timestamps: number[];      // epoch ms of each request within the window
}

interface RateLimitOpts {
  maxRequests: number;       // how many requests allowed in the window
  windowMs: number;          // sliding window size in milliseconds
}

interface CheckResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

// One Map per named bucket (e.g. per edge function) so limits are independent.
const buckets = new Map<string, Map<string, RateLimitEntry>>();

// ── Periodic cleanup: remove stale keys every 60 s ─────────
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(bucketsInner: Map<string, RateLimitEntry>, windowMs: number) {
  const now = Date.now();
  for (const [key, entry] of bucketsInner) {
    // Drop entries whose newest timestamp is outside the window
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < now - windowMs) {
      bucketsInner.delete(key);
    } else {
      // Prune timestamps outside the window
      entry.timestamps = entry.timestamps.filter((t) => t >= now - windowMs);
      if (entry.timestamps.length === 0) bucketsInner.delete(key);
    }
  }
}

// ── Public API ─────────────────────────────────────────────
export function rateLimit(
  bucketName: string,
  opts: RateLimitOpts,
): {
  check: (key: string) => CheckResult;
} {
  const { maxRequests, windowMs } = opts;

  // Get or create the bucket for this endpoint
  let bucket = buckets.get(bucketName);
  if (!bucket) {
    bucket = new Map();
    buckets.set(bucketName, bucket);
  }

  // Periodic global cleanup (runs at most once per minute)
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const b of buckets.values()) {
      cleanup(b, windowMs);
    }
  }

  return {
    check(key: string): CheckResult {
      const entry = bucket!.get(key);

      // No prior requests — allow immediately
      if (!entry || entry.timestamps.length === 0) {
        bucket!.set(key, { timestamps: [now] });
        return { allowed: true, remaining: maxRequests - 1, retryAfterSec: 0 };
      }

      // Prune timestamps outside the window
      entry.timestamps = entry.timestamps.filter((t) => t >= now - windowMs);

      if (entry.timestamps.length < maxRequests) {
        entry.timestamps.push(now);
        return { allowed: true, remaining: maxRequests - entry.timestamps.length, retryAfterSec: 0 };
      }

      // At the limit — calculate when the oldest timestamp in the window expires
      const oldestInWindow = entry.timestamps[0];
      const retryAfterMs = oldestInWindow + windowMs - now;
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      return { allowed: false, remaining: 0, retryAfterSec };
    },
  };
}

// ── Helper: extract a rate-limit key from a request ────────
// Returns user.id if authenticated, otherwise falls back to IP.
export function getRateLimitKey(
  req: Request,
  userId?: string,
): string {
  if (userId) return userId;
  // Fall back to client IP for unauthenticated endpoints
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}
