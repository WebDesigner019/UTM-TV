import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { getMaxFileSizeBytes } from "@/lib/env";
import { PermohonanForm } from "@/components/PermohonanForm";

export const dynamic = "force-dynamic";

export default function MediaPartnerPage() {
  const maxSizeMb = Math.round(getMaxFileSizeBytes() / (1024 * 1024));

  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">Pengajuan Permohonan Media Partner</h1>
        <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
          Lengkapi data acara dan unggah surat permohonan media partner. Simpan nomor rujukan untuk pelacakan.
        </p>
        <div className="mt-8 sm:mt-10">
          <PermohonanForm jenis="media_partner" maxSizeMb={maxSizeMb} variant="public" />
        </div>
      </main>
    </>
  );
}