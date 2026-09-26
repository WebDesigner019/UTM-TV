import { generateNomorRujukan, type JenisPrefix } from "@/lib/reference";

/**
 * Membuat record permohonan dengan nomor rujukan yang dijamin unik.
 *
 * generateNomorRujukan mengambil nomor urut berikutnya, jadi tetap bisa
 * bentrok bila dua insertions bersamaan memilih nomor yang sama sebelum salah
 * satunya selesai. Pola ini mencoba lagi maksimal lima kali dengan nomor baru
 * sebelum menyerah.
 */
export async function createWithNomorRujukan<T>(
  prefix: JenisPrefix,
  create: (nomorRujukan: string) => Promise<T>
): Promise<T> {
  let nomorRujukan = await generateNomorRujukan(prefix);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await create(nomorRujukan);
    } catch (error) {
      const isUniqueConflict =
        typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
      if (!isUniqueConflict) throw error;
      nomorRujukan = await generateNomorRujukan(prefix);
    }
  }

  throw new Error("Nomor rujukan gagal dibuat. Coba lagi.");
}
