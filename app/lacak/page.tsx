import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { LacakForm } from "./LacakForm";

export default function LacakPage() {
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-ink">Cek Status Permohonan</h1>
        <p className="mt-4 text-lg leading-8 text-slate-500">
          Pilih jenis pengajuan dan masukkan nomor rujukan. Untuk pengajuan liputan, gunakan email kampus yang sama dengan data pengajuan.
        </p>
        <div className="mt-10">
          <LacakForm />
        </div>
      </main>
    </>
  );
}
