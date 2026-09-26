import { prisma } from "@/lib/prisma";

export type JenisPrefix = "LIP" | "MP" | "KJ" | "PP";

/**
 * Nomor rujukan terbesar yang sudah dipakai untuk satu prefix dan tahun.
 *
 * Pencarian dilakukan pada nomor rujukan, bukan pada jumlah baris, karena
 * penghapusan satu record akan membuat hitungan meleset dan menghasilkan nomor
 * yang sudah terpakai. Urutannya zero-padded, jadi urutan leksikografis sama
 * dengan urutan numerik.
 */
async function findNomorTerakhir(jenis: JenisPrefix, prefix: string): Promise<string | null> {
  const args = {
    where: { nomorRujukan: { startsWith: prefix } },
    orderBy: { nomorRujukan: "desc" as const },
    select: { nomorRujukan: true }
  };

  switch (jenis) {
    case "LIP":
      return (await prisma.permohonanLiputan.findFirst(args))?.nomorRujukan ?? null;
    case "MP":
      return (await prisma.permohonanMediaPartner.findFirst(args))?.nomorRujukan ?? null;
    case "KJ":
      return (await prisma.permohonanKerjasama.findFirst(args))?.nomorRujukan ?? null;
    case "PP":
      return (await prisma.permohonanPeminjamanPodcast.findFirst(args))?.nomorRujukan ?? null;
  }
}

export async function generateNomorRujukan(jenis: JenisPrefix, tanggal = new Date()) {
  const year = tanggal.getFullYear();
  const prefix = `UTMTV-${jenis}-${year}-`;

  const terakhir = await findNomorTerakhir(jenis, prefix);
  const parsed = terakhir ? Number.parseInt(terakhir.slice(prefix.length), 10) : 0;
  const urutan = Number.isFinite(parsed) ? parsed : 0;

  return `${prefix}${String(urutan + 1).padStart(4, "0")}`;
}
