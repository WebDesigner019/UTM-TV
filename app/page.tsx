import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ShieldCheck, Video, Handshake, Megaphone, Mic, Phone } from "lucide-react";
import { CampusWatermark } from "@/components/CampusWatermark";
import { KalenderPermohonan } from "@/components/KalenderPermohonan";
import { PublicNav } from "@/components/PublicNav";
import { LandingAnimations } from "@/components/LandingAnimations";
import { getKalenderPermohonan, isKalenderPublikAktif } from "@/lib/kalender";
import { rentangGrid, tanggalDariKey } from "@/lib/kalender-grid";
import { todayISO } from "@/lib/status";

export const dynamic = "force-dynamic";

/**
 * Satu bulan kalender, dihitung sekali lalu dipakai untuk query maupun grid.
 *
 * `anchor` dikirim ke komponen supaya render server dan hidrasi klien
 * menggambar bulan yang sama persis. Kalau new Date() dipanggil terpisah di
 * kedua sisi, pergantian bulan tepat tengah malam bisa membuat mismatch.
 *
 * Satu bulan sudah cukup untuk dua tampilan: minggu berjalan selalu berada di
 * dalam grid bulan berjalan, karena grid mulai dari Senin pada atau sebelum
 * tanggal 1 dan berakhir pada Minggu pada atau setelah tanggal akhir.
 */
async function getKalender() {
  const aktif = await isKalenderPublikAktif();
  if (!aktif) return null;

  const anchor = todayISO();
  const events = await getKalenderPermohonan(rentangGrid(tanggalDariKey(anchor)));
  return { anchor, events };
}

export default async function Home() {
  const kalender = await getKalender().catch(() => null);

  return (
    <>
      <LandingAnimations />
      <CampusWatermark />
      <PublicNav />
      <main>
        <section className="bg-white/60 backdrop-blur">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
            <div>
              <Image
                src="/assets/utm-tv-logo.jpg"
                alt="Logo UTM TV"
                width={96}
                height={96}
                className="mb-8 h-20 w-20 rounded-2xl object-cover shadow-card"
                priority
                data-hero
              />
              <p data-hero className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">Layanan Kampus</p>
              <h1 data-hero className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-ink md:text-6xl">
                Selamat Datang di Website Pengajuan Kerjasama dan Media Partner UTM TV!
              </h1>
              <p data-hero className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Website ini digunakan untuk pengajuan Liputan, Kerjasama dan Media Partner bersama UTM TV,
                khususnya dalam bentuk publikasi poster, promosi acara, serta bentuk kolaborasi media lainnya.
              </p>
              <p data-hero className="mt-4 max-w-2xl leading-7 text-slate-600">
                Silakan membaca <span className="font-medium text-brand">SOP Media Partner UTM TV 2026</span> terlebih dahulu.
              </p>
              <div data-hero className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-5 py-4 text-sm text-amber-900 backdrop-blur">
                <p className="font-medium">Catatan: Pengisian formulir wajib menggunakan email resmi Universitas Trunojoyo Madura
                  (@trunojoyo.ac.id / @student.trunojoyo.ac.id) untuk memudahkan proses verifikasi dan tindak lanjut pengajuan.</p>
              </div>
              <div data-hero className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Phone className="h-4 w-4" />
                </span>
                <span>Contact Person Tim Admin UTM TV: <span className="font-semibold">+62 858-0150-7663</span></span>
              </div>
              <p data-hero className="mt-2 text-sm text-slate-500">
                Dapatkan informasi lebih lanjut terkait ketentuan dan kebutuhan Media Partner UTM TV melalui media sosial resmi UTM TV.
              </p>
            </div>
            <div data-hero className="card h-fit p-8">
              <div className="flex items-center gap-4">
                <span className="tile-icon h-12 w-12">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-semibold">Alur transparan</h2>
                  <p className="text-sm text-slate-500">Nomor rujukan, status, dan timeline tersedia setelah verifikasi.</p>
                </div>
              </div>
              <div className="mt-8 space-y-5 text-sm text-slate-700">
                {["Pilih jenis pengajuan sesuai kebutuhan", "Lengkapi formulir dan unggah surat", "Pantau status tanpa akun"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {kalender ? (
          <section className="border-y border-line/70 bg-white/60 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-12 md:py-16" data-reveal>
              <KalenderPermohonan anchor={kalender.anchor} events={kalender.events} />
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 data-reveal className="text-balance text-3xl font-bold tracking-tight text-ink md:text-4xl">Pilih Jenis Pengajuan</h2>
          <p data-reveal className="mt-3 text-lg text-slate-500">Pilih salah satu jenis pengajuan sesuai kebutuhan Anda bersama UTM TV.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-4" data-reveal-group>
            <JenisCard
              icon={<Megaphone className="h-6 w-6" />}
              title="Pengajuan Liputan"
              text="Ajukan permohonan liputan acara kampus Anda dan pantau statusnya sampai proses selesai."
              href="/ajukan"
              cta="Ajukan Liputan"
            />
            <JenisCard
              icon={<Handshake className="h-6 w-6" />}
              title="Pengajuan Media Partner"
              text="Bentuk kolaborasi publikasi poster dan promosi acara bersama UTM TV sebagai media partner."
              href="/ajukan/media-partner"
              cta="Ajukan Media Partner"
            />
            <JenisCard
              icon={<Video className="h-6 w-6" />}
              title="Pengajuan Kerjasama"
              text="Ajukan bentuk kerjasama lainnya bersama UTM TV dalam bentuk kolaborasi media."
              href="/ajukan/kerjasama"
              cta="Ajukan Kerjasama"
            />
            <JenisCard
              icon={<Mic className="h-6 w-6" />}
              title="Pengajuan Peminjaman Ruang Podcast"
              text="Ajukan peminjaman ruang podcast UTM TV untuk kebutuhan rekaman dan produksi konten Anda."
              href="/ajukan/peminjaman-podcast"
              cta="Ajukan Ruang Podcast"
            />
          </div>
        </section>

        <section className="border-y border-line/70 bg-gradient-to-b from-white/70 to-white/40 py-16 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 data-reveal className="text-balance text-3xl font-bold tracking-tight text-ink md:text-4xl">Terima Kasih</h2>
            <p data-reveal className="mt-4 text-lg leading-8 text-slate-500">
              Terima kasih telah menggunakan layanan pengajuan UTM TV.
              Kami siap membantu menghadirkan publikasi terbaik untuk acara Anda.
            </p>
            <div data-reveal className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/ajukan" className="btn-primary px-7 py-3">
                Ajukan Permohonan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/lacak" className="btn-secondary px-7 py-3">
                <Search className="h-4 w-4" /> Cek Status Permohonan
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer data-reveal className="border-t border-line/70 bg-white/60 px-4 py-8 text-center text-sm text-slate-500 backdrop-blur">
        UTM TV - Universitas Trunojoyo Madura
      </footer>
    </>
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
    <div
      className="card group flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
      data-reveal-item
    >
      <span className="tile-icon h-14 w-14 transition-transform duration-300 group-hover:scale-110">{icon}</span>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 flex-1 text-[15px] leading-6 text-slate-500">{text}</p>
      <Link href={href} className="btn-primary mt-7 self-start">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}