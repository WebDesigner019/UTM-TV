import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { MediaPartnerForm } from "./MediaPartnerForm";

export default function MediaPartnerPage() {
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Pengajuan Permohonan Media Partner</h1>
        <p className="mt-3 text-slate-600">
          Lengkapi data acara dan unggah surat permohonan media partner. Simpan nomor rujukan untuk pelacakan.
        </p>
        <div className="mt-6">
          <MediaPartnerForm />
        </div>
      </main>
    </>
  );
}