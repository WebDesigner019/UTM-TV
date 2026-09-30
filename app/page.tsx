import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Video, Handshake, Megaphone, Mic, Phone } from "lucide-react";
import { CampusWatermark } from "@/components/CampusWatermark";
import { KalenderPermohonan } from "@/components/KalenderPermohonan";
import { LayananProsedur } from "@/components/LayananProsedur";
import { PublicNav } from "@/components/PublicNav";
import { LandingAnimations } from "@/components/LandingAnimations";
import { getKalenderPermohonan, isKalenderPublikAktif } from "@/lib/kalender";
import { rentangGrid, tanggalDariKey } from "@/lib/kalender-grid";
import { todayISO } from "@/lib/status";

export const dynamic = "force-dynamic";

/**
 * Satu bulan kalender, dihitung sekali lalu dipakai untuk query maupun grid.
 *
 * `today` dikirim ke komponen supaya render server dan hidrasi klien
 * menggambar bulan yang sama persis. Kalau new Date() dipanggil terpisah di
 * kedua sisi, pergantian bulan tepat tengah malam bisa membuat mismatch.
 *
 * Hanya bulan berjalan yang dikirim. Bulan lain diambil klien dari
 * /api/kalender ketika pengguna menekan panah, jadi halaman ini tidak
 * membawa data bulan lain yang tidak sedang dilihat.
 */
async function getKalender() {
  const aktif = await isKalenderPublikAktif();
  if (!aktif) return null;

  const today = todayISO();
  const events = await getKalenderPermohonan(rentangGrid(tanggalDariKey(today)));
  return { today, events };
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
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:gap-12 md:py-24">
            <div>
              <Image
                src="/assets/utm-tv-logo.jpg"
                alt="Logo COMPACT"
                width={96}
                height={96}
                className="mb-6 h-16 w-16 rounded-2xl object-cover shadow-card sm:mb-8 sm:h-20 sm:w-20"
                priority
                data-hero
              />
              <p data-hero className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">UTM TV SERVICE SYSTEM</p>
              <h1 data-hero className="max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl md:text-6xl">
                COMPACT
              </h1>
              <p data-hero className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
                Cooperation, Media Partnership, Administration, Collaboration, &amp; Tracking
              </p>
              <div data-hero className="mt-8 flex items-center gap-2 text-sm text-slate-700">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Phone className="h-4 w-4" />
                </span>
                <span>Contact Person Tim Admin COMPACT: <span className="font-semibold">+62 858-0150-7663</span></span>
              </div>
            </div>
            <LayananProsedur />
          </div>
        </section>

        {kalender ? (
          <section className="border-y border-line/70 bg-white/60 backdrop-blur">
            <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 md:py-10" data-reveal>
              <KalenderPermohonan events={kalender.events} today={kalender.today} />
            </div>
          </section>
        ) : null}

        <section id="pilih-jenis" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:py-16">
          <h2 data-reveal className="text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">Pilih Jenis Pengajuan</h2>
          <p data-reveal className="mt-3 text-base text-slate-500 sm:text-lg">Pilih salah satu jenis pengajuan sesuai kebutuhan Anda bersama COMPACT.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 md:grid-cols-4" data-reveal-group>
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
              text="Bentuk kolaborasi publikasi poster dan promosi acara bersama COMPACT sebagai media partner."
              href="/ajukan/media-partner"
              cta="Ajukan Media Partner"
            />
            <JenisCard
              icon={<Video className="h-6 w-6" />}
              title="Pengajuan Kerjasama"
              text="Ajukan bentuk kerjasama lainnya bersama COMPACT dalam bentuk kolaborasi media."
              href="/ajukan/kerjasama"
              cta="Ajukan Kerjasama"
            />
            <JenisCard
              icon={<Mic className="h-6 w-6" />}
              title="Pengajuan Peminjaman Ruang Podcast"
              text="Ajukan peminjaman ruang podcast COMPACT untuk kebutuhan rekaman dan produksi konten Anda."
              href="/ajukan/peminjaman-podcast"
              cta="Ajukan Ruang Podcast"
            />
          </div>
        </section>

        <section className="border-y border-line/70 bg-gradient-to-b from-white/70 to-white/40 py-12 backdrop-blur sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 data-reveal className="text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">Terima Kasih</h2>
            <p data-reveal className="mt-4 text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
              Terima kasih telah menggunakan layanan pengajuan COMPACT.
              Kami siap membantu menghadirkan publikasi terbaik untuk acara Anda.
            </p>
            <div data-reveal className="mt-10 flex justify-center">
              <Link href="/lacak" className="btn-secondary px-7 py-3">
                <Search className="h-4 w-4" /> Cek Status Permohonan
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer data-reveal className="border-t border-line/70 bg-white/60 px-4 py-8 text-center text-sm text-slate-500 backdrop-blur">
        COMPACT - Universitas Trunojoyo Madura
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
      className="card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated sm:p-8"
      data-reveal-item
    >
      <span className="tile-icon h-14 w-14 transition-transform duration-300 group-hover:scale-110">{icon}</span>
      <h3 className="mt-6 break-words text-lg font-semibold tracking-tight text-ink sm:text-xl">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-[15px] leading-6 text-slate-500">{text}</p>
      {/* Tombol dibuat selebar kartu di ponsel supaya target sentuhnya besar,
          lalu kembali ke lebar isinya di layar lebar. */}
      <Link href={href} className="btn-primary mt-7 w-full justify-center sm:w-auto sm:self-start">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}