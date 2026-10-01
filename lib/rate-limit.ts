type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Percaya X-Forwarded-For hanya kalau diaktifkan lewat environment.
 *
 * Header ini diisi oleh reverse proxy, tapi aplikasi tidak bisa membedakan
 * "proxy saya yang menambahkannya" dari "penyerang yang menambahkannya
 * sendiri". Kalau X-Forwarded-For dipercaya tanpa syarat, penyerang cukup
 * membuat IP baru tiap percobaan dan seluruh rate limit untuk login, lacak,
 * dan reset password dilewati.
 *
 * Nilai yang benar di produksi: "1" kalau ada satu proxy di depan aplikasi
 * (umumnya nginx atau Caddy). Kosong atau "0" kalau aplikasi diekspos
 * langsung, sehingga X-Forwarded-For diabaikan dan yang dipakai X-Real-IP
 * dari proxy, atau "unknown" kalau tidak ada sama sekali.
 *
 * Yang dipakai entri dari kanan sebanyak jumlah proxy yang dikonfigurasi, bukan
 * klien pertama di rantai, karena rantai XFF bisa dipalsukan dari luar.
 */
function jumlahProxyTepercaya() {
  const raw = (process.env.TRUSTED_PROXY_HOPS || "").trim();
  if (!raw) return 0;
  const hops = Number(raw);
  return Number.isInteger(hops) && hops > 0 ? hops : 0;
}

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

/**
 * Alamat klien untuk keperluan rate limit.
 *
 * Dengan TRUSTED_PROXY_HOPS = 1 dan satu proxy di depan, X-Forwarded-For
 * berisi "<klien>, <proxy>". Yang dipilih entri dari kanan sebanyak jumlah
 * proxy yang dikonfigurasi, yaitu "<klien>". Kalau jumlah entri kurang dari
 * jumlah proxy, hasilnya "unknown": lebih baik semua orang berbagi satu bucket
 * daripada memberi penyerang bucket baru setiap permintaan.
 */
export function getClientIp(request: Request) {
  const hops = jumlahProxyTepercaya();
  if (hops > 0) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      const entries = forwarded.split(",").map((value) => value.trim()).filter(Boolean);
      const index = entries.length - hops;
      if (index >= 0) return entries[index];
    }
    return "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
