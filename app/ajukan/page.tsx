import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { PermohonanForm } from "@/components/PermohonanForm";
import { getMaxFileSizeBytes } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function AjukanPage() {
  const maxSizeMb = Math.round(getMaxFileSizeBytes() / (1024 * 1024));

  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-ink">Ajukan Permohonan Liputan</h1>
        <p className="mt-4 text-lg leading-8 text-slate-500">
          Lengkapi data acara dan unggah surat pengajuan. Konfirmasi akan dikirim ke email kampus Anda.
        </p>
        <div className="mt-10">
          <PermohonanForm jenis="liputan" maxSizeMb={maxSizeMb} variant="public" />
        </div>
      </main>
    </>
  );
}
