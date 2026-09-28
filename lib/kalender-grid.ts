import type { JenisPermohonan } from "@/lib/status";

/**
 * Matematika kalender, bebas dari React dan bebas dari Prisma.
 *
 * Dipakai bersama oleh komponen kalender di klien dan oleh
 * scripts/check-kalender.ts, jadi logika bulan, minggu, dan rentang tanggal
 * hanya ada di satu tempat dan bisa diuji tanpa browser.
 *
 * Semua tanggal di file ini dibangun dari bagian tanggal lokal
 * (new Date(y, m, d)) dan tidak pernah lewat toISOString(). toISOString()
 * mengubah tengah malam lokal menjadi UTC dan bisa menggeser satu hari,
 * sedangkan kunci "YYYY-MM-DD" di sini harus persis sama dengan kunci event
 * yang dibuat server dari kolom @db.Date. Lihat toDateInputValue() di
 * lib/permohonan-form.ts untuk sisi server.
 */

/** Urutan kolom dimulai Senin, mengikuti kebiasaan kalender di Indonesia. */
export const HARI_MINGGU = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Jumlah baris tetap enam supaya tinggi kalender tidak bergeser tiap bulan. */
export const BARIS_KALENDER = 6;

export const BULAN_PANJANG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

/** Satu sel kalender: tanggal, kunci "YYYY-MM-DD", dan apakah milik bulan ini. */
export type SelKalender = {
  tanggal: Date;
  key: string;
  bulanIni: boolean;
};

/**
 * Satu event yang dikirim server ke klien. Sengaja tidak ada email, nomor
 * WhatsApp, kontak penanggung jawab, nomor rujukan, maupun nama berkas:
 * kalender ini tampil di landing page tanpa login.
 */
export type EventKalender = {
  key: string;
  jenis: JenisPermohonan;
  id: number;
  tanggal: string;
  namaInstansi: string;
  namaAcara: string;
  tempatAcara: string | null;
};

/** Tanggal lokal tengah malam dari bagian y/m/d. */
function tanggalLokal(year: number, month: number, day: number) {
  return new Date(year, month, day);
}

/** "YYYY-MM-DD" dari tanggal lokal, bukan dari toISOString(). */
export function keTanggalKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Tanggal lokal dari kunci "YYYY-MM-DD".
 *
 * new Date("2026-10-05") dihitung sebagai tengah malam UTC, sehingga
 * formatTanggal() bisa mundur satu hari di zona waktu negatif. Memecah
 * kuncinya dan membangun Date lokal menghindari itu.
 */
export function tanggalDariKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return new Date(Number.NaN);
  return tanggalLokal(year, month - 1, day);
}

/** Tanggal lokal, digeser sejumlah hari. new Date() menormalkan roll over. */
export function tambahHari(date: Date, jumlah: number) {
  return tanggalLokal(date.getFullYear(), date.getMonth(), date.getDate() + jumlah);
}

/** Senin pada minggu yang memuat tanggal tersebut. */
export function awalMingguSenin(date: Date) {
  const hariDalamMinggu = date.getDay();
  const geser = (hariDalamMinggu + 6) % 7;
  return tambahHari(date, -geser);
}

/**
 * Grid enam kali tujuh untuk bulan pada `anchor`.
 *
 * Baris pertama dimulai dari Senin pada atau sebelum tanggal 1, baris terakhir
 * berakhir pada Minggu pada atau setelah tanggal akhir. Baris yang lebih sedikit
 * sengaja tidak dipakai supaya tinggi kalender tidak melompat-lompat saat pindah
 * bulan: lima baris akan memotong tanggal 31 pada bulan yang mulai hari Sabtu.
 */
export function buildGridBulan(anchor: Date): SelKalender[][] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const mulai = awalMingguSenin(tanggalLokal(year, month, 1));
  const jumlahSel = BARIS_KALENDER * 7;

  const sel: SelKalender[] = [];
  for (let i = 0; i < jumlahSel; i += 1) {
    const tanggal = tambahHari(mulai, i);
    sel.push({ tanggal, key: keTanggalKey(tanggal), bulanIni: tanggal.getMonth() === month });
  }
  const baris: SelKalender[][] = [];
  for (let i = 0; i < BARIS_KALENDER; i += 1) {
    baris.push(sel.slice(i * 7, i * 7 + 7));
  }
  return baris;
}

/** Tujuh sel untuk minggu yang memuat `anchor`. */
export function buildGridMinggu(anchor: Date): SelKalender[] {
  const mulai = awalMingguSenin(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const tanggal = tambahHari(mulai, i);
    return { tanggal, key: keTanggalKey(tanggal), bulanIni: true };
  });
}

/**
 * Rentang query untuk satu bulan kalender, dalam batas tengah malam UTC.
 *
 * Kolom tanggal di database bertipe @db.Date dan dibaca Prisma sebagai
 * tengah malam UTC, jadi batasnya ikut tengah malam UTC. Kedua ujung
 * dilebihkan satu hari sebagai pengaman: kalau driver MySQL ternyata
 * mengonversi zona waktu, hari pertama dan hari terakhir tidak boleh ikut
 * hilang. "sampai" bersifat eksklusif.
 */
export function rentangGrid(anchor: Date) {
  const grid = buildGridBulan(anchor);
  const pertama = grid[0][0].tanggal;
  const terakhir = grid[BARIS_KALENDER - 1][6].tanggal;

  return {
    dari: new Date(Date.UTC(pertama.getFullYear(), pertama.getMonth(), pertama.getDate() - 1)),
    sampai: new Date(Date.UTC(terakhir.getFullYear(), terakhir.getMonth(), terakhir.getDate() + 2))
  };
}

/** Judul bulan kalender, mis. "Oktober 2026". */
export function judulBulan(anchor: Date) {
  return `${BULAN_PANJANG[anchor.getMonth()]} ${anchor.getFullYear()}`;
}

/** Rentang tanggal minggu dalam bahasa manusia, mis. "1 - 7 Oktober 2026". */
export function judulMinggu(anchor: Date) {
  const mulai = awalMingguSenin(anchor);
  const selesai = tambahHari(mulai, 6);
  const bulanMulai = BULAN_PANJANG[mulai.getMonth()];
  const bulanSelesai = BULAN_PANJANG[selesai.getMonth()];
  const tahunMulai = mulai.getFullYear();
  const tahunSelesai = selesai.getFullYear();

  if (bulanMulai === bulanSelesai && tahunMulai === tahunSelesai) {
    return `${mulai.getDate()} - ${selesai.getDate()} ${bulanMulai} ${tahunMulai}`;
  }
  if (tahunMulai === tahunSelesai) {
    return `${mulai.getDate()} ${bulanMulai} - ${selesai.getDate()} ${bulanSelesai} ${tahunMulai}`;
  }
  return `${mulai.getDate()} ${bulanMulai} ${tahunMulai} - ${selesai.getDate()} ${bulanSelesai} ${tahunSelesai}`;
}
