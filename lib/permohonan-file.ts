import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/upload";
import type { JenisPermohonan } from "@/lib/status";
import { isJenisPermohonan } from "@/lib/permohonan-schema";

export type FileTidakDitemukan = "permohonan" | "file" | "hilang";

export type BerkasPermohonan = {
  /** Uint8Array karena Buffer tidak termasuk BodyInit yang valid. */
  body: Uint8Array<ArrayBuffer>;
  mimeType: string;
  originalName: string;
};

/** Ambil satu field file milik sebuah jenis, atau undefined bila kosong. */
function pickFileFields(item: Record<string, unknown>, jenis: JenisPermohonan, fileKey: string | null) {
  if (jenis === "peminjaman_podcast") {
    const prefix = fileKey === "pernyataan" ? "filePernyataan" : "fileRekomBakk";
    return {
      filePath: item[`${prefix}Path`] as string | null,
      fileMimeType: item[`${prefix}MimeType`] as string | null,
      fileOriginalName: item[`${prefix}OriginalName`] as string | null
    };
  }

  return {
    filePath: item.filePath as string | null,
    fileMimeType: item.fileMimeType as string | null,
    fileOriginalName: item.fileOriginalName as string | null
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

  const item = (await (jenis === "liputan"
    ? prisma.permohonanLiputan.findUnique({ where: { id } })
    : jenis === "media_partner"
      ? prisma.permohonanMediaPartner.findUnique({ where: { id } })
      : jenis === "kerjasama"
        ? prisma.permohonanKerjasama.findUnique({ where: { id } })
        : prisma.permohonanPeminjamanPodcast.findUnique({ where: { id } }))) as Record<
    string,
    unknown
  > | null;

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
