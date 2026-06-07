/**
 * BASIT in-memory rate limiter.
 *
 * NOT: Bu sadece tek-instance (lokal/dev) icin guvenilirdir. Vercel/Edge
 * deploylarinda her instance ayri counter tutar, bu da koruma saglamaz.
 * Production icin Upstash/Redis Rate Limit (token bucket) kullan.
 *
 * Kullanim: const ok = takeToken(`recover:${ip}`, 3, 60_000);
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function takeToken(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now };
  }
  b.count += 1;
  return { ok: true, remaining: limit - b.count, retryAfterMs: 0 };
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}
