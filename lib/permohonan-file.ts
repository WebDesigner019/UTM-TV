import fs from "fs/promises";
import { resolveUploadPath } from "@/lib/upload";
import type { JenisPermohonan } from "@/lib/status";
import { isJenisPermohonan } from "@/lib/permohonan-schema";
import { getFileFields } from "@/lib/permohonan-form";
import { findPermohonan } from "@/lib/permohonan-record";

export type FileTidakDitemukan = "permohonan" | "file" | "hilang";

export type BerkasPermohonan = {
  /** Uint8Array karena Buffer tidak termasuk BodyInit yang valid. */
  body: Uint8Array<ArrayBuffer>;
  mimeType: string;
  originalName: string;
};

/**
 * Ambil nama kolom file yang diminta.
 *
 * Peminjaman podcast punya dua lampiran, jadi fileKey memilih salah satunya.
 * Nama kolomnya diambil dari definisi field, bukan dirangkai dari prefix
 * string supaya tidak harus diubah dua kali bila kolomnya berganti nama.
 */
function pickFileFields(
  item: Record<string, unknown>,
  jenis: JenisPermohonan,
  fileKey: string | null
) {
  const files = getFileFields(jenis);
  const wanted =
    jenis === "peminjaman_podcast" && fileKey === "pernyataan" ? "surat_pernyataan" : null;
  const field = wanted ? files.find((def) => def.name === wanted) : files[0];

  const columns = field?.fileColumns;
  if (!columns) {
    return { filePath: null, fileMimeType: null, fileOriginalName: null };
  }

  return {
    filePath: item[columns.path] as string | null,
    fileMimeType: item[columns.mimeType] as string | null,
    fileOriginalName: item[columns.originalName] as string | null
  };
}

/**
 * Ambil berkas lampiran sebuah permohonan untuk dikirim sebagai response.
 *
 * Ada tiga cara gagal, dan pemanggil perlu membedakan ketiganya:
 *  - "permohonan": tidak ada record dengan id dan jenis tersebut
 *  - "file": record ada tapi tidak punya lampiran sama sekali, yang terjadi
 *    pada data yang dicatat manual oleh admin
 *  - "hilang": database menunjuk berkas yang tidak ada lagi di storage, mis.
 *    karena storage di-restart atau berkas terhapus di luar aplikasi
 */
export async function ambilBerkasPermohonan(
  jenis: string,
  id: number,
  fileKey: string | null
): Promise<BerkasPermohonan | FileTidakDitemukan> {
  if (!isJenisPermohonan(jenis)) return "permohonan";

  const item = (await findPermohonan(jenis, id)) as Record<string, unknown> | null;

  if (!item) return "permohonan";

  const { filePath, fileMimeType, fileOriginalName } = pickFileFields(item, jenis, fileKey);
  if (!filePath) return "file";

  let body: Buffer;
  try {
    body = await fs.readFile(resolveUploadPath(filePath));
  } catch (error) {
    // ENOENT berarti storage kehilangan berkasnya; jangan sampai jadi 500.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`[BERKAS HILANG] ${jenis}#${id} menunjuk ${filePath} yang tidak ada di storage`);
      return "hilang";
    }
    throw error;
  }

  return {
    body: new Uint8Array(body),
    mimeType: fileMimeType || "application/octet-stream",
    originalName: fileOriginalName || "lampiran"
  };
}
