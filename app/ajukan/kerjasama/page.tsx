import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { KerjasamaForm } from "./KerjasamaForm";

export default function KerjasamaPage() {
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-ink">Pengajuan Permohonan Kerjasama</h1>
        <p className="mt-4 text-lg leading-8 text-slate-500">
          Lengkapi data acara dan unggah surat permohonan kerjasama. Simpan nomor rujukan untuk pelacakan.
        </p>
        <div className="mt-10">
          <KerjasamaForm />
        </div>
      </main>
    </>
  );
}