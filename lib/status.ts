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

/**
 * Status bawaan saat admin mencatat pengajuan lewat "Tambah Data".
 *
 * Catatan manual biasanya untuk acara yang sudah lolos verifikasi, jadi
 * bawaannya "disetujui" supaya langsung ikut tampil di kalender publik. Status
 * lain masih bisa dipilih admin, dan form publik tetap tidak punya pilihan ini
 * sehingga pengajuan dari pemohon selalu mulai sebagai "diterima".
 *
 * Satu konstanta dipakai bersama oleh select di form dan oleh route admin,
 * karena select yang lupa diubah akan membuat tampilan dan database berbeda.
 */
export const STATUS_AWAL_ADMIN: StatusPermohonan = "disetujui";

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
 * karena itu memakai yellow, bukan amber.
 *
 * Petak di dalam sel kalender memakai isian pekat, bukan warna muda. Versi
 * sebelumnya memakai isian -50 dengan teks berwarna: di atas sel kalender yang
 * putih, purple-50 dan blue-50 nyaris tak terlihat, dan teks 10px jadi yang
 * lebih dulu hilang, bukan warnanya. Jadi isiannya sekarang -700 untuk keempat
 * jenis dan teksnya putih. Shade -600 tidak dipakai karena tidak semua bisa
 * menahan teks putih: emerald-600 cuma 3,8:1 dan yellow-600 2,9:1, sedangkan
 * angka di dalam petak cuma 9px, jadi yang dipegang ambang 4,5:1. Pada -700:
 * purple 7,0:1, blue 6,7:1, yellow 4,9:1, emerald 5,5:1.
 *
 * Chip filter dan chip di modal hari sengaja dibiarkan muda. Keduanya muncul
 * di atas panel yang sudah menyatu dengan kartu, jadi isian pekat di sana
 * akan lebih ramai daripada informasinya, dan chip filter yang aktif sudah
 * ditandai oleh titik warnanya.
 */
export const JENIS_KALENDER: Record<
  JenisPermohonan,
  { label: string; petakClass: string; chipClass: string; dotClass: string }
> = {
  kerjasama: {
    label: "Collab",
    petakClass: "bg-purple-700",
    chipClass: "border-purple-300 bg-purple-50 text-purple-800",
    dotClass: "bg-purple-700"
  },
  liputan: {
    label: "Liputan",
    petakClass: "bg-blue-700",
    chipClass: "border-blue-300 bg-blue-50 text-blue-800",
    dotClass: "bg-blue-700"
  },
  media_partner: {
    label: "Medpart",
    petakClass: "bg-yellow-700",
    chipClass: "border-yellow-400 bg-yellow-50 text-yellow-900",
    dotClass: "bg-yellow-700"
  },
  peminjaman_podcast: {
    label: "Podcast",
    petakClass: "bg-emerald-700",
    chipClass: "border-emerald-300 bg-emerald-50 text-emerald-800",
    dotClass: "bg-emerald-700"
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
