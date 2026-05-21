import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  nomor_rujukan: z.string().min(5),
  email: z.string().email()
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`lacak:${ip}`, 10, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const body = schema.parse(await request.json());
    const permohonan = await prisma.permohonan.findFirst({
      where: {
        nomorRujukan: body.nomor_rujukan.trim().toUpperCase(),
        email: normalizeEmail(body.email)
      },
      select: {
        nomorRujukan: true,
        namaInstansi: true,
        namaAcara: true,
        tanggalAcara: true,
        tempatAcara: true,
        status: true,
        pesanPemohon: true,
        createdAt: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: {
            statusLama: true,
            statusBaru: true,
            pesan: true,
            createdAt: true
          }
        }
      }
    });

    if (!permohonan) {
      return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ permohonan });
  } catch {
    return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
  }
}
