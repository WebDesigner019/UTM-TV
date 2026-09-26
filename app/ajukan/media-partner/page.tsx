import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { getMaxFileSizeBytes } from "@/lib/env";
import { MediaPartnerForm } from "./MediaPartnerForm";

export const dynamic = "force-dynamic";

export default function MediaPartnerPage() {
  const maxSizeMb = Math.round(getMaxFileSizeBytes() / (1024 * 1024));

  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-ink">Pengajuan Permohonan Media Partner</h1>
        <p className="mt-4 text-lg leading-8 text-slate-500">
          Lengkapi data acara dan unggah surat permohonan media partner. Simpan nomor rujukan untuk pelacakan.
        </p>
        <div className="mt-10">
          <MediaPartnerForm maxSizeMb={maxSizeMb} />
        </div>
      </main>
    </>
  );
}