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
