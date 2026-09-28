import type { StatusPermohonan } from "@prisma/client";

export const JENIS_OPTIONS = ["liputan", "media_partner", "kerjasama", "peminjaman_podcast"] as const;
export type JenisPermohonan = (typeof JENIS_OPTIONS)[number];

export const STATUS_OPTIONS: StatusPermohonan[] = [
  "diterima",
  "disetujui",
  "ditolak",
  "selesai"
];

export const STATUS_LABEL: Record<StatusPermohonan, string> = {
  diterima: "Pengajuan masuk",
  disetujui: "Pengajuan disetujui",
  ditolak: "Ditolak",
  selesai: "Selesai"
};

export const JENIS_LABEL: Record<JenisPermohonan, string> = {
  liputan: "liputan",
  media_partner: "media partner",
  kerjasama: "kerjasama",
  peminjaman_podcast: "peminjaman ruang podcast"
};

export const JENIS_TITLE: Record<JenisPermohonan, string> = {
  liputan: "Pengajuan Liputan",
  media_partner: "Pengajuan Media Partner",
  kerjasama: "Pengajuan Kerjasama",
  peminjaman_podcast: "Pengajuan Peminjaman Ruang Podcast"
};

export const JENIS_TITLE_SHORT: Record<JenisPermohonan, string> = {
  liputan: "Liputan",
  media_partner: "Media Partner",
  kerjasama: "Kerjasama",
  peminjaman_podcast: "Peminjaman Ruang Podcast"
};

/**
 * Tampilan kalender publik untuk tiap jenis.
 *
 * Dataruh di sini, bukan di komponen kalender, supaya badge sel, chip filter,
 * legenda, dan modal hari membaca satu sumber yang sama. Class Tailwind ditulis
 * utuh, bukan dirakit dari nama warna, supaya JIT memindainya di file yang sama.
 *
 * Satu label per jenis dipakai di semua tempat, jadi tidak ada lagi nama
 * panjang yang hanya muat di modal. Kosakatanya persis seperti di spesifikasi
 * kalender: collab, liputan, medpart, podcast.
 *
 * Warnanya juga mengikuti spesifikasi: purple, blue, yellow, green. Medpart
 * karena itu memakai yellow, bukan amber. Isian yellow-50 hampir putih, jadi
 * teksnya sengaja gelap (yellow-800 dan yellow-900) supaya tetap terbaca di
 * atas sel berwarna putih.
 */
export const JENIS_KALENDER: Record<
  JenisPermohonan,
  { label: string; badgeClass: string; chipClass: string; dotClass: string }
> = {
  kerjasama: {
    label: "Collab",
    badgeClass: "border border-purple-200 bg-purple-50 text-purple-700",
    chipClass: "border-purple-300 bg-purple-50 text-purple-800",
    dotClass: "bg-purple-600"
  },
  liputan: {
    label: "Liputan",
    badgeClass: "border border-blue-200 bg-blue-50 text-blue-700",
    chipClass: "border-blue-300 bg-blue-50 text-blue-800",
    dotClass: "bg-blue-600"
  },
  media_partner: {
    label: "Medpart",
    badgeClass: "border border-yellow-200 bg-yellow-50 text-yellow-800",
    chipClass: "border-yellow-400 bg-yellow-50 text-yellow-900",
    dotClass: "bg-yellow-500"
  },
  peminjaman_podcast: {
    label: "Podcast",
    badgeClass: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    chipClass: "border-emerald-300 bg-emerald-50 text-emerald-800",
    dotClass: "bg-emerald-600"
  }
};

export const JENIS_DESCRIPTION: Record<JenisPermohonan, string> = {
  liputan: "Pencatatan liputan acara, lengkap dengan nama instansi, tanggal, dan tempat acara.",
  media_partner: "Pencatatan permintaan kerja sama media partner untuk sebuah acara.",
  kerjasama: "Pencatatan permintaan kerja sama institutional untuk sebuah acara.",
  peminjaman_podcast: "Pencatatan peminjaman ruang podcast beserta jadwal dan dokumen pendukung."
};

/**
 * Tanggal hari ini sebagai YYYY-MM-DD menurut zona waktu lokal.
 * Jangan pakai toISOString() karena hasilnya UTC dan bisa meleset satu hari
 * untuk WIB setelah pukul 17:00.
 */
export function todayISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTanggal(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export function formatTanggalWaktu(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}
