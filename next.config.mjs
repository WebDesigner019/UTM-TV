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
      }
    ];
  }
};

export default nextConfig;
