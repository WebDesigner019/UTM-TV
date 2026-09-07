import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ShieldCheck, Video, Handshake, Megaphone, Phone } from "lucide-react";
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
  const [totalLiputan, totalMediaPartner, totalKerjasama, disetujui, pengajuanMasuk] = await Promise.all([
    prisma.permohonanLiputan.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.permohonanMediaPartner.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.permohonanKerjasama.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.permohonanLiputan.count({ where: { status: "disetujui", createdAt: { gte: start, lt: end } } }),
    prisma.permohonanLiputan.count({ where: { status: "diterima", createdAt: { gte: start, lt: end } } })
  ]);
  return { year, total: totalLiputan + totalMediaPartner + totalKerjasama, disetujui, pengajuanMasuk };
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
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-5xl">
                Selamat Datang di Website Pengajuan Kerjasama dan Media Partner UTM TV!
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Website ini digunakan untuk pengajuan Liputan, Kerjasama dan Media Partner bersama UTM TV,
                khususnya dalam bentuk publikasi poster, promosi acara, serta bentuk kolaborasi media lainnya.
              </p>
              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                Silakan membaca <span className="font-medium text-brand">SOP Media Partner UTM TV 2026</span> terlebih dahulu.
              </p>
              <div className="mt-6 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-medium">Catatan: Pengisian formulir wajib menggunakan email resmi Universitas Trunojoyo Madura
                  (@trunojoyo.ac.id / @student.trunojoyo.ac.id) untuk memudahkan proses verifikasi dan tindak lanjut pengajuan.</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <Phone className="h-4 w-4 text-brand" />
                <span>Contact Person Tim Admin UTM TV: <span className="font-semibold">+62 858-0150-7663</span></span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Dapatkan informasi lebih lanjut terkait ketentuan dan kebutuhan Media Partner UTM TV melalui media sosial resmi UTM TV.
              </p>
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
                {["Pilih jenis pengajuan sesuai kebutuhan", "Lengkapi formulir dan unggah surat", "Pantau status tanpa akun"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-brand" />
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
              <Stat label={`Total pengajuan ${stats.year}`} value={stats.total} />
              <Stat label="Disetujui" value={stats.disetujui} />
              <Stat label="Pengajuan masuk" value={stats.pengajuanMasuk} />
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold">Pilih Jenis Pengajuan</h2>
          <p className="mt-2 text-slate-600">Pilih salah satu jenis pengajuan sesuai kebutuhan Anda bersama UTM TV.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <JenisCard
              icon={<Megaphone className="h-8 w-8 text-brand" />}
              title="Pengajuan Liputan"
              text="Ajukan permohonan liputan acara kampus Anda dan pantau statusnya sampai proses selesai."
              href="/ajukan"
              cta="Ajukan Liputan"
            />
            <JenisCard
              icon={<Handshake className="h-8 w-8 text-brand" />}
              title="Pengajuan Media Partner"
              text="Bentuk kolaborasi publikasi poster dan promosi acara bersama UTM TV sebagai media partner."
              href="/ajukan/media-partner"
              cta="Ajukan Media Partner"
            />
            <JenisCard
              icon={<Video className="h-8 w-8 text-brand" />}
              title="Pengajuan Kerjasama"
              text="Ajukan bentuk kerjasama lainnya bersama UTM TV dalam bentuk kolaborasi media."
              href="/ajukan/kerjasama"
              cta="Ajukan Kerjasama"
            />
          </div>
        </section>

        <section className="border-y border-line bg-gradient-to-b from-slate-50 to-white py-14">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-semibold">Terima Kasih</h2>
            <p className="mt-3 text-slate-600">
              Terima kasih telah menggunakan layanan pengajuan UTM TV.
              Kami siap membantu menghadirkan publikasi terbaik untuk acara Anda.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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

function JenisCard({
  icon,
  title,
  text,
  href,
  cta
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col rounded border border-line bg-white p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded bg-brand/10">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{text}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded bg-brand px-4 py-2.5 font-semibold text-white hover:bg-teal-800"
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}