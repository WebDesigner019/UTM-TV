import Link from "next/link";
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
      <main className="mx-auto max-w-2xl px-4 py-14 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Permohonan terkirim</p>
        <h1 className="mt-3 text-3xl font-bold">Simpan nomor rujukan Anda</h1>
        <div className="mt-6 rounded border border-line bg-white p-8">
          <div className="break-all text-4xl font-bold text-ink">{nomor}</div>
          <p className="mt-4 text-slate-600">
            {butuhEmail
              ? "Nomor ini diperlukan untuk mengecek status permohonan bersama email kampus yang digunakan saat pengajuan."
              : "Nomor ini diperlukan untuk mengecek status permohonan Anda."}
          </p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="rounded bg-brand px-5 py-3 font-semibold text-white hover:bg-teal-800" href="/lacak">
            Cek Status
          </Link>
          <Link className="rounded border border-line bg-white px-5 py-3 font-semibold hover:bg-slate-50" href="/">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </>
  );
}
