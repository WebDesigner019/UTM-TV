import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/env";

// Disajikan sebagai /sitemap.xml. Hanya halaman publik yang butuh ditemukan
// lewat pencarian: landing, formulir pengajuan, dan pelacakan status.
// /ajukan/sukses tidak ikut karena itu halaman konfirmasi sekali pakai,
// dan seluruh /admin tidak ikut karena bukan konsumsi publik.
const PUBLIC_PATHS: Array<{
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/ajukan", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ajukan/kerjasama", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ajukan/media-partner", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ajukan/peminjaman-podcast", changeFrequency: "monthly", priority: 0.8 },
  { path: "/lacak", changeFrequency: "monthly", priority: 0.9 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const now = new Date();
  return PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority
  }));
}
