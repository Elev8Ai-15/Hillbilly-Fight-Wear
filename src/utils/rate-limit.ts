// ============================================
// SEC-12: Edge-native rate limiting for Cloudflare Workers
//
// Sliding-window counter per IP, stored in a Map that lives for
// the lifetime of the isolate.  Cloudflare Workers recycle isolates
// frequently, so the map naturally stays small.  Stale entries are
// pruned on every check to prevent unbounded growth.
//
// This is the recommended "Option A" approach — zero external deps,
// zero KV calls, works on free-tier Workers with <1 ms overhead.
// ============================================
import type { Context, Next } from 'hono'

interface RateLimitEntry {
  /** Timestamps (ms) of recent requests inside the current window */
  hits: number[]
}

interface RateLimitConfig {
  /** Window size in milliseconds (default: 15 × 60 × 1000 = 15 min) */
  windowMs?: number
  /** Max requests per window (default: 10) */
  max?: number
  /** JSON error message returned on 429 */
  message?: string
}

// One map per route-group — created at module scope so it survives
// across requests within the same isolate.
const stores = new Map<string, Map<string, RateLimitEntry>>()

/**
 * Returns a Hono middleware that rate-limits by client IP.
 *
 * Usage:
 *   api.post('/contact', rateLimit({ max: 5, windowMs: 15*60*1000 }), handler)
 */
export function rateLimit(cfg: RateLimitConfig = {}) {
  const windowMs  = cfg.windowMs ?? 15 * 60 * 1000   // 15 min
  const max       = cfg.max ?? 10
  const message   = cfg.message ?? 'Too many requests — please try again later.'

  // Each call to rateLimit() gets its own store so different
  // route groups have independent counters.
  const storeKey = `${windowMs}:${max}:${Math.random()}`
  const store    = new Map<string, RateLimitEntry>()
  stores.set(storeKey, store)

  return async (c: Context, next: Next) => {
    const now = Date.now()
    const windowStart = now - windowMs

    // Best-effort client IP: Cloudflare always sets cf-connecting-ip
    // in production; falls back to x-forwarded-for / x-real-ip in dev.
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown'

    // Prune stale entries globally every ~100 requests (cheap)
    if (Math.random() < 0.01) {
      for (const [key, entry] of store) {
        entry.hits = entry.hits.filter((t) => t > windowStart)
        if (entry.hits.length === 0) store.delete(key)
      }
    }

    // Get or create entry for this IP
    let entry = store.get(ip)
    if (!entry) {
      entry = { hits: [] }
      store.set(ip, entry)
    }

    // Drop timestamps outside the current window
    entry.hits = entry.hits.filter((t) => t > windowStart)

    // Check limit
    if (entry.hits.length >= max) {
      const retryAfterSec = Math.ceil(
        (entry.hits[0] + windowMs - now) / 1000
      )
      c.res = new Response(
        JSON.stringify({ error: message }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil((entry.hits[0] + windowMs) / 1000)),
          },
        }
      )
      return
    }

    // Record this request
    entry.hits.push(now)

    // Set rate-limit headers on the successful response
    await next()
    c.res.headers.set('X-RateLimit-Limit', String(max))
    c.res.headers.set('X-RateLimit-Remaining', String(max - entry.hits.length))
    c.res.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil((now + windowMs) / 1000))
    )
  }
}
