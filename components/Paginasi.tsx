import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Maksimal jumlah nomor halaman yang ditampilkan sekaligus. */
const JUMLAH_TOMBOL = 5;

/* 44px di ponsel supaya target sentuhnya layak, lalu kembali 36px di sm
   supaya tujuh kontrol masih muat satu baris di tablet. */
const KELAS = "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 sm:h-9 sm:min-w-9";
const KELAS_AKTIF = `${KELAS} bg-brand text-white`;
const KELAS_NORMAL = `${KELAS} text-ink hover:bg-slate-100`;
const KELAS_MATI = `${KELAS} text-slate-300`;

/**
 * Kontrol halaman untuk tabel admin.
 *
 * Nomor halaman dibatasi lima tombol yang ikut bergeser dengan halaman aktif,
 * supaya tabel yang sedang dibaca tidak tergantikan oleh daftar angka yang
 * panjang. Tombol yang tidak bisa dipakai dirender sebagai span, bukan link,
 * supaya tidak bisa diklik dan terbaca oleh layar reader sebagai tautan mati.
 * Href dibentuk pemanggil supaya filter yang sedang aktif ikut terbawa.
 */
export function Paginasi({
  page,
  totalHalaman,
  href
}: {
  page: number;
  totalHalaman: number;
  href: (page: number) => string;
}) {
  if (totalHalaman <= 1) return null;

  // Geser jendela lima tombol supaya halaman aktif selalu di tengah, kecuali
  // di awal atau di akhir daftar.
  const akhir = Math.min(totalHalaman, Math.max(1, page - Math.floor(JUMLAH_TOMBOL / 2)) + JUMLAH_TOMBOL - 1);
  const awal = Math.max(1, akhir - JUMLAH_TOMBOL + 1);
  const nomor = Array.from({ length: akhir - awal + 1 }, (_, index) => awal + index);

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center gap-1">
      {page > 1 ? (
        <Link aria-label="Halaman sebelumnya" className={KELAS_NORMAL} href={href(page - 1)} rel="prev">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Sebelumnya</span>
        </Link>
      ) : (
        <span aria-hidden="true" className={KELAS_MATI}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {nomor.map((nomorHalaman) =>
        nomorHalaman === page ? (
          <span key={nomorHalaman} aria-current="page" className={KELAS_AKTIF}>
            <span className="sr-only">Halaman </span>
            {nomorHalaman}
          </span>
        ) : (
          <Link
            key={nomorHalaman}
            aria-label={`Halaman ${nomorHalaman}`}
            className={KELAS_NORMAL}
            href={href(nomorHalaman)}
          >
            {nomorHalaman}
          </Link>
        )
      )}

      {page < totalHalaman ? (
        <Link aria-label="Halaman berikutnya" className={KELAS_NORMAL} href={href(page + 1)} rel="next">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Berikutnya</span>
        </Link>
      ) : (
        <span aria-hidden="true" className={KELAS_MATI}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
