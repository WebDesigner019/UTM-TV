import { prisma } from "@/lib/prisma";

export async function generateNomorRujukan(tanggal = new Date()) {
  const year = tanggal.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const count = await prisma.permohonan.count({
    where: {
      createdAt: {
        gte: start,
        lt: end
      }
    }
  });

  return `UTMTV-${year}-${String(count + 1).padStart(4, "0")}`;
}
