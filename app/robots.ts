import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/env";

// Disajikan sebagai /robots.txt. Rute /admin dan /api sengaja ditutup dari
// crawler: halaman admin sudah dipasangi X-Robots-Tag noindex di next.config,
// dan endpoint API tidak ada gunanya di indeks pencarian.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"]
      }
    ],
    sitemap: `${getAppUrl()}/sitemap.xml`
  };
}
