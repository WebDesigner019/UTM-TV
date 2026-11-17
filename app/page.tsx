import Link from "next/link";
import Image from "next/image";
import { Phone, Search } from "lucide-react";
import { KalenderPermohonan } from "@/components/KalenderPermohonan";
import { LayananProsedur } from "@/components/LayananProsedur";
import { PublicNav } from "@/components/PublicNav";
import { LandingAnimations } from "@/components/LandingAnimations";
import { ScrollAccordion } from "@/components/ScrollAccordion";
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

        <ScrollAccordion />

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
      <footer className="border-t border-line/70 bg-white/60 px-4 py-8 text-center text-sm text-slate-500 backdrop-blur">
        <p>UTM-TV Integritas Terpercaya</p>
        <p className="mt-1 text-xs text-slate-400">COMPACT 2.0.0</p>
      </footer>
    </>
  );
}
