import { prisma } from "@/lib/prisma";

export type JenisPrefix = "LIP" | "MP" | "KJ" | "PP";

export async function generateNomorRujukan(jenis: JenisPrefix, tanggal = new Date()) {
  const year = tanggal.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const where = { createdAt: { gte: start, lt: end } };

  let count: number;
  switch (jenis) {
    case "LIP":
      count = await prisma.permohonanLiputan.count({ where });
      break;
    case "MP":
      count = await prisma.permohonanMediaPartner.count({ where });
      break;
    case "KJ":
      count = await prisma.permohonanKerjasama.count({ where });
      break;
    case "PP":
      count = await prisma.permohonanPeminjamanPodcast.count({ where });
      break;
  }

  return `UTMTV-${jenis}-${year}-${String(count + 1).padStart(4, "0")}`;
}
