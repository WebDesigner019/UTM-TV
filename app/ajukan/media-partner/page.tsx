import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { MediaPartnerForm } from "./MediaPartnerForm";

export default function MediaPartnerPage() {
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
          <MediaPartnerForm />
        </div>
      </main>
    </>
  );
}