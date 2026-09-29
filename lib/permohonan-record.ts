import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { JenisPermohonan } from "@/lib/status";

/**
 * Satu-satunya tempat yang memetakan jenis permohonan ke model Prisma-nya.
 *
 * Keempat model punya nama kolom yang berbeda, jadi setiap operasi di sini
 * memakai tipe longgar. Konsekuensinya satu-saatnya: pemanggilan ini terkunci
 * di file ini, bukan tersebar di setiap route dan lib.
 */
export type PermohonanDelegate = {
  findUnique(args: any): Promise<any>;
  findMany(args: any): Promise<any[]>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
};

export type RiwayatDelegate = {
  create(args: any): Promise<any>;
};

/**
 * Delegate model permohonan. `client` bisa diisi dengan transaksi Prisma
 * supaya update dan pembuatan baris riwayat jalan dalam satu transaksi.
 */
export function getPermohonanDelegate(
  jenis: JenisPermohonan,
  client: Prisma.TransactionClient = prisma
): PermohonanDelegate {
  switch (jenis) {
    case "liputan":
      return client.permohonanLiputan as unknown as PermohonanDelegate;
    case "media_partner":
      return client.permohonanMediaPartner as unknown as PermohonanDelegate;
    case "kerjasama":
      return client.permohonanKerjasama as unknown as PermohonanDelegate;
    case "peminjaman_podcast":
      return client.permohonanPeminjamanPodcast as unknown as PermohonanDelegate;
  }
}

/** Delegate tabel status history yang dimiliki sebuah jenis permohonan. */
export function getRiwayatDelegate(
  jenis: JenisPermohonan,
  client: Prisma.TransactionClient = prisma
): RiwayatDelegate {
  switch (jenis) {
    case "liputan":
      return client.statusHistoryLiputan as unknown as RiwayatDelegate;
    case "media_partner":
      return client.statusHistoryMediaPartner as unknown as RiwayatDelegate;
    case "kerjasama":
      return client.statusHistoryKerjasama as unknown as RiwayatDelegate;
    case "peminjaman_podcast":
      return client.statusHistoryPeminjamanPodcast as unknown as RiwayatDelegate;
  }
}

/** Ambil satu record permohonan, atau null bila id tidak ada. */
export async function findPermohonan(
  jenis: JenisPermohonan,
  id: number,
  args: Record<string, unknown> = {}
) {
  return getPermohonanDelegate(jenis).findUnique({ where: { id }, ...args });
}

/**
 * Nomor WhatsApp dari field kontak penanggung jawab.
 *
 Hanya tiga jenis yang punya kolom no_wa langsung. Sisanya menyimpan satu
 field bebas teks yang isinya bisa "Nama (Nomor)", jadi nomor diambil lewat
 regex. Kalau tidak ada digit sama sekali, hasilnya null: dulu fungsi ini
 mengembalikan teksnya apa adanya sehingga "Ahmad" terkirim ke Fonnte
 sebagai target dan gagal diam-diam.
 */
export function extractNomorWa(kontak: string | null | undefined): string | null {
  if (!kontak) return null;
  const match = kontak.match(/\+?\d[\d\s-]{7,}/);
  return match ? match[0].replace(/[\s-]/g, "") : null;
}
