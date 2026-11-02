import { createHash } from "node:crypto";

export function hashIp(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}:${process.env.ADMIN_SESSION_SECRET ?? "salt"}`).digest("hex").slice(0, 32);
}

/** Minimal in-memory rate limiter (per process). Replace with Upstash/Redis in production. */
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (b.n >= limit) return false;
  b.n++;
  return true;
}
