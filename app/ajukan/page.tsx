import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { AjukanForm } from "./AjukanForm";

export default function AjukanPage() {
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Ajukan Permohonan Liputan</h1>
        <p className="mt-3 text-slate-600">
          Lengkapi data acara dan unggah surat pengajuan. Konfirmasi akan dikirim ke email kampus Anda.
        </p>
        <div className="mt-6">
          <AjukanForm />
        </div>
      </main>
    </>
  );
}
