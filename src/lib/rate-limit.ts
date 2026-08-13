import { NextRequest } from 'next/server';

// ponytail: shared in-memory per-IP rate limiter — resets on process restart (fine for shared hosting).
// Limits are deliberately generous so normal business flow is never blocked.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientIp(req: NextRequest): string {
  // Trust the framework-provided IP (behind reverse proxies Next already resolves it)
  return req.ip || 'unknown';
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

/**
 * Returns true if the request should be REJECTED (limit exceeded).
 * Call at the top of a handler: `if (isRateLimited(req)) return 429;`
 */
export function isRateLimited(req: NextRequest, key: string, cfg: RateLimitConfig): boolean {
  const ip = clientIp(req);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();

  const bucket = buckets.get(bucketKey);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + cfg.windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > cfg.limit;
}

/** Shared configs — generous on purpose, see comments */
export const LIMITS = {
  // 10 login attempts per 15 min per IP — plenty for a real customer, throttles bots
  LOGIN: { limit: 10, windowMs: 15 * 60 * 1000 },
  // 5 new accounts per 15 min per IP
  REGISTER: { limit: 5, windowMs: 15 * 60 * 1000 },
  // 5 per 15 min — admin is a single high-value target
  ADMIN_LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 },
  // 5 password changes per 15 min per IP
  PASSWORD: { limit: 5, windowMs: 15 * 60 * 1000 },
  // 10 order placements per 15 min per IP — never blocks a real shopper
  ORDER: { limit: 10, windowMs: 15 * 60 * 1000 },
  // 20 uploads per 15 min per IP (existing behavior, kept)
  UPLOAD: { limit: 20, windowMs: 15 * 60 * 1000 },
  // 5 password reset requests per 15 min per IP (existing behavior, kept)
  FORGOT: { limit: 5, windowMs: 15 * 60 * 1000 },
  // 10 review submissions per 15 min per IP
  REVIEW: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const;
