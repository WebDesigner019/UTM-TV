import { toDateInputValue } from "@/lib/permohonan-form";
import { getPermohonanDelegate } from "@/lib/permohonan-record";
import { prisma } from "@/lib/prisma";
import type { EventKalender } from "@/lib/kalender-grid";
import { JENIS_OPTIONS, type JenisPermohonan } from "@/lib/status";
import type { StatusPermohonan } from "@prisma/client";

/**
 * Pengambilan event untuk kalender publik di landing page.
 *
 * Status yang dimuat sengaja "disetujui" dan "selesai". Kalau hanya
 * "disetujui", setiap acara yang sudah lewat lenyap dari kalender begitu admin
 * menandainya selesai, sehingga kalender tidak bisa lagi menjawab "apa yang
 * sudah diliput bulan lalu". Ditolak dan yang masih menunggu review tetap
 * disembunyikan.
 */
export const STATUS_KALENDER: StatusPermohonan[] = ["disetujui", "selesai"];

/** Kolom yang dipakai tiap jenis. Satu peta, bukan empat blok query. */
type KolomKalender = {
  tanggal: string;
  instansi: string;
  tempat?: string;
  /** Satu kolom jam, misalnya waktuAcara pada liputan. */
  waktu?: string;
  /**
   * Dua kolom jam untuk yang punya rentang, misalnya peminjaman podcast.
   * Dipakai berpasangan; kalau satu terisi dan satu tidak, rentangnya tetap
   * dirakit dari yang ada.
   */
  waktuMulai?: string;
  waktuSelesai?: string;
};

const KOLOM_KALENDER: Record<JenisPermohonan, KolomKalender> = {
  liputan: {
    tanggal: "tanggalAcara",
    instansi: "namaInstansi",
    tempat: "tempatAcara",
    waktu: "waktuAcara"
  },
  media_partner: { tanggal: "tanggalRequestUpload", instansi: "fakultasOrganisasi" },
  kerjasama: { tanggal: "tanggalRequestUpload", instansi: "fakultasOrganisasi" },
  peminjaman_podcast: {
    tanggal: "tanggalPeminjaman",
    instansi: "namaInstansi",
    waktuMulai: "waktuMulai",
    waktuSelesai: "waktuSelesai"
  }
};

/**
 * Select per jenis.
 *
 * Daftar kolom ini juga batas privasi landing page: tidak ada email, no_wa,
 * kontak_penanggung_jawab (berisi nomor WhatsApp untuk podcast), nomor rujukan,
 * pesan pemohon, catatan internal, maupun lampiran yang ikut terbawa ke
 * klien. Menambah kolom di sini berarti menambah data publik, jadi harus
 * disengaja.
 *
 * WaktuMulai dan waktuSelesai podcast ikut terbawa karena jadwal peminjaman
 * ruang memang bagian dari acara yang diumumkan, sama seperti
 * tanggalPeminjaman-nya. Yang tetap ditolak justru kontak_penanggung_jawab
 * dari tabel yang sama: jam borrow tidak berarti nomor teleponnya ikut publik.
 */
function selectKalender(kolom: KolomKalender) {
  return {
    id: true,
    namaAcara: true,
    [kolom.tanggal]: true,
    [kolom.instansi]: true,
    ...(kolom.tempat ? { [kolom.tempat]: true } : {}),
    ...(kolom.waktu ? { [kolom.waktu]: true } : {}),
    ...(kolom.waktuMulai ? { [kolom.waktuMulai]: true } : {}),
    ...(kolom.waktuSelesai ? { [kolom.waktuSelesai]: true } : {})
  };
}

/**
 * Jam acara sebagai satu string siap tampil: "HH:mm" untuk yang punya satu
 * kolom, "HH:mm - HH:mm" untuk yang punya rentang, null kalau tidak ada.
 *
 * Bentuknya sama dengan kolom UnifiedItem.waktu di app/admin/page.tsx, jadi
 * kedua layar tidak pernah menampilkan jam berbeda untuk baris yang sama.
 */
function waktuDariRow(kolom: KolomKalender, row: any): string | null {
  if (kolom.waktu) {
    const nilai = row[kolom.waktu];
    return nilai ? String(nilai) : null;
  }
  if (kolom.waktuMulai && kolom.waktuSelesai) {
    // Kedua kolomnya wajib di skema, tapi dirakit dari yang benar-benar ada
    // supaya satu sisi yang kosong tidak menghasilkan "09:00 - ".
    const rentang = [row[kolom.waktuMulai], row[kolom.waktuSelesai]]
      .filter(Boolean)
      .map(String);
    return rentang.length > 0 ? rentang.join(" - ") : null;
  }
  return null;
}

function toEvent(
  jenis: JenisPermohonan,
  kolom: KolomKalender,
  row: any
): EventKalender | null {
  // Kolom tanggal tidak wajib di semua jenis: tanggalRequestUpload pada
  // permohonan kerjasama bisa null, dan record seperti itu tidak bisa
  // ditempatkan di kalender. Lewati, jangan dibiarkan membuat sel kosong.
  const tanggal = toDateInputValue(row[kolom.tanggal]);
  if (!tanggal) return null;

  return {
    key: `${jenis}-${row.id}`,
    jenis,
    id: row.id,
    tanggal,
    namaInstansi: String(row[kolom.instansi] ?? ""),
    namaAcara: String(row.namaAcara ?? ""),
    tempatAcara: kolom.tempat ? (row[kolom.tempat] ? String(row[kolom.tempat]) : null) : null,
    waktu: waktuDariRow(kolom, row)
  };
}

/**
 * Seluruh event disetujui atau selesai dalam rentang tanggal, sudah diratakan
 * per tanggal "YYYY-MM-DD" supaya klien tidak perlu memformat ulang.
 *
 * Keempat query jalan bareng. Batas rentang tangannya tengah malam UTC karena
 * kolom bertipe @db.Date; lihat rentangGrid() di lib/kalender-grid.ts.
 */
export async function getKalenderPermohonan(rentang: { dari: Date; sampai: Date }) {
  const perJenis = await Promise.all(
    JENIS_OPTIONS.map(async (jenis) => {
      const kolom = KOLOM_KALENDER[jenis];
      const rows = await getPermohonanDelegate(jenis).findMany({
        where: {
          status: { in: STATUS_KALENDER },
          [kolom.tanggal]: { gte: rentang.dari, lt: rentang.sampai }
        },
        select: selectKalender(kolom),
        orderBy: { [kolom.tanggal]: "asc" }
      });
      return rows
        .map((row: any) => toEvent(jenis, kolom, row))
        .filter((event: EventKalender | null): event is EventKalender => event !== null);
    })
  );

  return perJenis.flat().sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

/**
 * Landing page hanya menampilkan kalender kalau pengaturan statistik publik
 * menyala. Kalender membocorkan lebih banyak dari angka statistik, jadi memakai
 * saklar yang sama: satu baris database, tanpa UI admin baru.
 */
export async function isKalenderPublikAktif() {
  const setting = await prisma.pengaturan.findUnique({
    where: { key: "tampilkan_statistik_landing" },
    select: { value: true }
  });
  return setting?.value === "true";
}
