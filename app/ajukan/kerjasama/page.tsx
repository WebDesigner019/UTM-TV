import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { KerjasamaForm } from "./KerjasamaForm";

export default function KerjasamaPage() {
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Pengajuan Permohonan Kerjasama</h1>
        <p className="mt-3 text-slate-600">
          Lengkapi data acara dan unggah surat permohonan kerjasama. Simpan nomor rujukan untuk pelacakan.
        </p>
        <div className="mt-6">
          <KerjasamaForm />
        </div>
      </main>
    </>
  );
}