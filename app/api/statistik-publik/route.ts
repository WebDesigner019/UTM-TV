import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const setting = await prisma.pengaturan.findUnique({
    where: { key: "tampilkan_statistik_landing" }
  });

  if (setting?.value !== "true") {
    return NextResponse.json({ aktif: false });
  }

  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const [total, disetujui, dalamSemakan] = await Promise.all([
    prisma.permohonan.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.permohonan.count({ where: { status: "disetujui", createdAt: { gte: start, lt: end } } }),
    prisma.permohonan.count({ where: { status: "dalam_semakan", createdAt: { gte: start, lt: end } } })
  ]);

  return NextResponse.json({
    aktif: true,
    tahun: year,
    total,
    disetujui,
    dalam_semakan: dalamSemakan
  });
}
