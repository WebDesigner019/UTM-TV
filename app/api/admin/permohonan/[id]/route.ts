import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS } from "@/lib/status";
import { sendStatusChangedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["diterima", "dalam_semakan", "disetujui", "ditolak", "dijadualkan", "selesai"]),
  pesan_pemohon: z.string().optional().nullable(),
  catatan_internal: z.string().optional().nullable()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const id = Number(params.id);
  const permohonan = await prisma.permohonan.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { admin: { select: { nama: true, email: true } } }
      }
    }
  });

  if (!permohonan) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ permohonan });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  try {
    const id = Number(params.id);
    const body = updateSchema.parse(await request.json());
    if (!STATUS_OPTIONS.includes(body.status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    const existing = await prisma.permohonan.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.permohonan.update({
        where: { id },
        data: {
          status: body.status,
          pesanPemohon: body.pesan_pemohon || null,
          catatanInternal: body.catatan_internal || null
        }
      });

      await tx.statusHistory.create({
        data: {
          permohonanId: id,
          statusLama: existing.status,
          statusBaru: body.status,
          pesan: body.pesan_pemohon || null,
          changedByAdminId: admin.id
        }
      });

      return item;
    });

    if (existing.status !== updated.status || body.pesan_pemohon) {
      await sendStatusChangedEmail({
        email: updated.email,
        nomorRujukan: updated.nomorRujukan,
        status: updated.status,
        pesan: body.pesan_pemohon
      }).catch((error) => console.error("Gagal mengirim email status:", error));
    }

    return NextResponse.json({ permohonan: updated });
  } catch {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }
}
