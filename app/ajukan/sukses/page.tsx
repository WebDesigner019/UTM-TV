import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CampusWatermark } from "@/components/CampusWatermark";
import { PublicNav } from "@/components/PublicNav";

export default function SuksesPage({ searchParams }: { searchParams: { nomor?: string; jenis?: string } }) {
  const nomor = searchParams.nomor || "-";
  const jenis = searchParams.jenis || "liputan";
  const butuhEmail = jenis === "liputan";
  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <span className="tile-icon mx-auto h-16 w-16">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">Permohonan terkirim</p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-ink">Simpan nomor rujukan Anda</h1>
        <div className="card mt-8 p-10">
          <div className="break-all text-4xl font-bold tracking-tight text-ink">{nomor}</div>
          <p className="mt-4 leading-7 text-slate-500">
            {butuhEmail
              ? "Nomor ini diperlukan untuk mengecek status permohonan bersama email kampus yang digunakan saat pengajuan."
              : "Nomor ini diperlukan untuk mengecek status permohonan Anda."}
          </p>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary px-7 py-3" href="/lacak">
            Cek Status
          </Link>
          <Link className="btn-secondary px-7 py-3" href="/">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </>
  );
}