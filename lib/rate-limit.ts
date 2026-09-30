type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Sederhana in-memory rate limit.
 *
 * Tidak dibagikan antar proses dan akan hilang saat restart, sesuai kebutuhan
 * aplikasi ini. Pembersihan bucket kadaluarsa dilakukan saat diakses agar
 * memori tidak terus bertambah.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Bersihkan bucket yang sudah lewat masa berlakunya sekali per panggilan.
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);

  if (!bucket) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
