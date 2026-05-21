import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS } from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();
  const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
  const take = 15;
  const skip = (page - 1) * take;

  const where: Prisma.PermohonanWhereInput = {
    ...(status && STATUS_OPTIONS.includes(status as any) ? { status: status as any } : {}),
    ...(q
      ? {
          OR: [
            { nomorRujukan: { contains: q } },
            { namaInstansi: { contains: q } },
            { namaAcara: { contains: q } },
            { email: { contains: q.toLowerCase() } }
          ]
        }
      : {})
  };

  const [items, total, counts] = await Promise.all([
    prisma.permohonan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        nomorRujukan: true,
        namaInstansi: true,
        email: true,
        namaAcara: true,
        tanggalAcara: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.permohonan.count({ where }),
    prisma.permohonan.groupBy({
      by: ["status"],
      _count: { status: true }
    })
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / take), counts });
}
