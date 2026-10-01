/** @type {import('next').NextConfig} */

// Header keamanan untuk semua response. App ini menyimpan berkas unggahan
// milik orang lain dan menampilkannya lewat endpoint preview, jadi header ini
// yang menjaga berkas itu tidak dipakai untuk memuat halaman atau menebak
// content type-nya.
//
// sandbox di CSP preview penting karena lampiran diunggah oleh siapa saja yang
// bisa mengirim form publik: tanpa sandbox, PDF yang sengaja dibuat bisa
// menjalankan script di origin aplikasi ini lewat endpoint preview.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains"
  }
];

const nextConfig = {
  // Container production hanya menyalin .next/standalone beserta dependensi
  // yang benar-benar terpakai, jadi image tidak ikut membawa devDependencies
  // dan seluruh node_modules. `next start` tetap bisa dipakai di luar Docker.
  output: "standalone",
  // X-Powered-By: Next.js hanya memberi tahu versi framework yang dipakai.
  // Dihilangkan supaya pemindai tidak bisa memilih target berdasarkan versi.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    }
  },
  async headers() {
    return [
      {
        source: "/api/admin/permohonan/:id/file/preview",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy", value: "sandbox; default-src 'none'" }
        ]
      },
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        // Halaman admin dan endpoint API tidak ada gunanya di indeks mesin
        // pencari. Login yang terindeks juga memperbesar permukaan serangan
        // tebak password lewat bot yang memindai dari internet.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  }
};

export default nextConfig;
