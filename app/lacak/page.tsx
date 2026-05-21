import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { LacakForm } from "./LacakForm";

export default function LacakPage() {
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Cek Status Permohonan</h1>
        <p className="mt-3 text-slate-600">
          Masukkan nomor rujukan dan email kampus yang sama dengan data pengajuan.
        </p>
        <div className="mt-6">
          <LacakForm />
        </div>
      </main>
    </>
  );
}
