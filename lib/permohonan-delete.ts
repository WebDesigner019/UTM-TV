import { getFileFields } from "@/lib/permohonan-form";
import { getPermohonanDelegate } from "@/lib/permohonan-record";
import { deleteUploadedFile } from "@/lib/upload";
import type { JenisPermohonan } from "@/lib/status";

export class PermohonanHapusError extends Error {}

/**
 * Kumpulkan path lampiran sebuah record.
 *
 * Daftar kolom path diambil dari definisi form, bukan ditulis ulang di sini:
 * peminjaman podcast punya dua set lampiran, tiga jenis lainnya satu, dan
 * jumlah itu berubah kalau ada jenis baru.
 */
function kumpulkanPathLampiran(
  jenis: JenisPermohonan,
  record: Record<string, any>
): string[] {
  return getFileFields(jenis)
    .map((field) => (field.fileColumns ? (record[field.fileColumns.path] as string | null) : null))
    .filter((value): value is string => Boolean(value));
}

/**
 * Hapus satu permohonan untuk selamanya.
 *
 * Berbeda dengan update, operasi ini tidak bisa dibatalkan dan tidak punya
 * jalur dry-run, jadi pemanggil wajib memakai dialog konfirmasi dulu.
 *
 * Tidak ada baris audit yang bisa ditulis: keempat tabel status_history punya
 * onDelete: Cascade dari record induk, jadi satu-satunya tempat untuk mencatat
 * "data dihapus" ikut terhapus bersama request-nya. Karena itu nama admin dan
 * nomor rujukan dicetak ke log server, itu jejak terakhir yang tersisa.
 *
 * Berkas tidak bisa ikut terhapus lewat cascade karena yang terisi di database
 * cuma nama relatifnya, jadi penghapusan berkas baru dilakukan setelah record
 * hilang. Urutannya penting dibalik: kalau berkas dihapus lebih dulu dan
 * delete-nya gagal, record yang masih ada akan menunjuk lampiran yang sudah
 * hilang dan preview-nya langsung rusak.
 */
export async function hapusPermohonan(input: {
  jenis: JenisPermohonan;
  id: number;
  admin: { id: number; nama: string };
}): Promise<{ nomorRujukan: string }> {
  const { jenis, id, admin } = input;

  const existing = await getPermohonanDelegate(jenis).findUnique({ where: { id } });
  if (!existing) throw new PermohonanHapusError("Data tidak ditemukan.");

  const paths = kumpulkanPathLampiran(jenis, existing);

  await getPermohonanDelegate(jenis).delete({ where: { id } });

  // Kegagalan hapus berkas ditelan oleh deleteUploadedFile: record-nya sudah
  // tidak ada, sisa berkas tidak boleh membuat permintaan ini gagal padahal
  // penghapusannya sendiri sudah berhasil.
  await Promise.all(paths.map((relativePath) => deleteUploadedFile(relativePath)));

  console.log(`[HAPUS PERMOHONAN] ${jenis}#${id} ${existing.nomorRujukan} oleh ${admin.nama}`);

  return { nomorRujukan: existing.nomorRujukan };
}
