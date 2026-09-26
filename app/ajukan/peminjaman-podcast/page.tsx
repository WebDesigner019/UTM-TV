import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { PermohonanForm } from "@/components/PermohonanForm";
import { getMaxFileSizeBytes } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function PeminjamanPodcastPage() {
  const maxSizeMb = Math.round(getMaxFileSizeBytes() / (1024 * 1024));

  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-ink">Pengajuan Peminjaman Ruang Podcast</h1>
        <p className="mt-4 text-lg leading-8 text-slate-500">
          Lengkapi data peminjaman dan unggah surat rekomendasi BAKK serta surat pernyataan. Simpan nomor rujukan untuk pelacakan.
        </p>
        <div className="mt-10">
          <PermohonanForm jenis="peminjaman_podcast" maxSizeMb={maxSizeMb} variant="public" />
        </div>
      </main>
    </>
  );
}
