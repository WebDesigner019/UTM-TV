import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { CampusWatermark } from "@/components/CampusWatermark";
import { PublicNav } from "@/components/PublicNav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const setting = await prisma.pengaturan.findUnique({ where: { key: "tampilkan_statistik_landing" } });
  if (setting?.value !== "true") return null;
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const [total, disetujui, pengajuanMasuk] = await Promise.all([
    prisma.permohonan.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.permohonan.count({ where: { status: "disetujui", createdAt: { gte: start, lt: end } } }),
    prisma.permohonan.count({ where: { status: "diterima", createdAt: { gte: start, lt: end } } })
  ]);
  return { year, total, disetujui, pengajuanMasuk };
}

export default async function Home() {
  const stats = await getStats().catch(() => null);

  return (
    <>
      <CampusWatermark />
      <PublicNav />
      <main>
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:py-20">
            <div>
              <Image
                src="/assets/utm-tv-logo.jpg"
                alt="Logo UTM TV"
                width={96}
                height={96}
                className="mb-6 h-20 w-20 rounded object-cover shadow-sm"
                priority
              />
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">Layanan Kampus</p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">
                Sistem Pengajuan Liputan UTM TV
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Ajukan permohonan liputan acara kampus Anda dan pantau statusnya sampai proses selesai.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/ajukan"
                  className="inline-flex items-center justify-center gap-2 rounded bg-brand px-5 py-3 font-semibold text-white hover:bg-teal-800"
                >
                  Ajukan Permohonan <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/lacak"
                  className="inline-flex items-center justify-center gap-2 rounded border border-line bg-white px-5 py-3 font-semibold hover:bg-slate-50"
                >
                  <Search className="h-4 w-4" /> Cek Status Permohonan
                </Link>
              </div>
            </div>
            <div className="rounded border border-line bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-brand" />
                <div>
                  <h2 className="font-semibold">Alur transparan</h2>
                  <p className="text-sm text-slate-600">Nomor rujukan, status, dan timeline tersedia setelah verifikasi.</p>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                {["Gunakan email kampus UTM", "Unggah surat pengajuan", "Pantau status tanpa akun"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {stats ? (
          <section className="border-y border-line bg-slate-100">
            <div className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-3">
              <Stat label={`Total permohonan ${stats.year}`} value={stats.total} />
              <Stat label="Disetujui" value={stats.disetujui} />
              <Stat label="Pengajuan masuk" value={stats.pengajuanMasuk} />
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold">Syarat utama</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Info title="Email kampus" text="Hanya menerima email @student.trunojoyo.ac.id dan @trunojoyo.ac.id." />
            <Info title="Surat pengajuan" text="Format PDF, DOC, DOCX, JPG, atau PNG dengan batas ukuran sesuai konfigurasi." />
            <Info title="Nomor rujukan" text="Simpan nomor rujukan untuk melacak permohonan bersama email yang sama." />
          </div>
        </section>
      </main>
      <footer className="border-t border-line bg-white px-4 py-6 text-center text-sm text-slate-600">
        UTM TV - Universitas Trunojoyo Madura
      </footer>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-line bg-white p-5">
      <div className="text-3xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded border border-line bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
