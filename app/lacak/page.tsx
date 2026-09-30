import { PublicNav } from "@/components/PublicNav";
import { CampusWatermark } from "@/components/CampusWatermark";
import { LacakForm } from "./LacakForm";

export default function LacakPage() {
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
          Cek Status Permohonan
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
          Pilih jenis pengajuan dan masukkan nomor rujukan. Untuk pengajuan liputan, gunakan email kampus yang sama dengan data pengajuan.
        </p>
        <div className="mt-8 sm:mt-10">
          <LacakForm />
        </div>
      </main>
    </>
  );
}
