import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS } from "@/lib/status";
import { sendStatusChangedEmail, sendPermohonanDisetujuiEmail } from "@/lib/email";
import { sendWaToUser, sendWaMediaPartnerToUser, sendWaKerjasamaToUser } from "@/lib/wa";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["diterima", "disetujui", "ditolak", "selesai"]),
  pesan_pemohon: z.string().optional().nullable(),
  catatan_internal: z.string().optional().nullable()
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const id = Number(params.id);
  const url = new URL(request.url);
  const jenis = url.searchParams.get("jenis") || "liputan";

  let permohonan: any = null;
  if (jenis === "liputan") {
    permohonan = await prisma.permohonanLiputan.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nama: true, email: true } } }
        }
      }
    });
  } else if (jenis === "media_partner") {
    permohonan = await prisma.permohonanMediaPartner.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nama: true, email: true } } }
        }
      }
    });
  } else if (jenis === "kerjasama") {
    permohonan = await prisma.permohonanKerjasama.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nama: true, email: true } } }
        }
      }
    });
  }

  if (!permohonan) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ permohonan, jenis });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  try {
    const id = Number(params.id);
    const url = new URL(request.url);
    const jenis = url.searchParams.get("jenis") || "liputan";
    const body = updateSchema.parse(await request.json());
    if (!STATUS_OPTIONS.includes(body.status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    let updated: any = null;
    let existing: any = null;

    const historyData = {
      statusBaru: body.status,
      pesan: body.pesan_pemohon || null,
      changedByAdminId: admin.id
    };

    if (jenis === "liputan") {
      existing = await prisma.permohonanLiputan.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
      updated = await prisma.$transaction(async (tx) => {
        const item = await tx.permohonanLiputan.update({
          where: { id },
          data: {
            status: body.status,
            pesanPemohon: body.pesan_pemohon || null,
            catatanInternal: body.catatan_internal || null
          }
        });
        await tx.statusHistoryLiputan.create({
          data: {
            permohonanId: id,
            statusLama: existing.status,
            ...historyData
          }
        });
        return item;
      });
    } else if (jenis === "media_partner") {
      existing = await prisma.permohonanMediaPartner.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
      updated = await prisma.$transaction(async (tx) => {
        const item = await tx.permohonanMediaPartner.update({
          where: { id },
          data: {
            status: body.status,
            pesanPemohon: body.pesan_pemohon || null,
            catatanInternal: body.catatan_internal || null
          }
        });
        await tx.statusHistoryMediaPartner.create({
          data: {
            permohonanId: id,
            statusLama: existing.status,
            ...historyData
          }
        });
        return item;
      });
    } else if (jenis === "kerjasama") {
      existing = await prisma.permohonanKerjasama.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
      updated = await prisma.$transaction(async (tx) => {
        const item = await tx.permohonanKerjasama.update({
          where: { id },
          data: {
            status: body.status,
            pesanPemohon: body.pesan_pemohon || null,
            catatanInternal: body.catatan_internal || null
          }
        });
        await tx.statusHistoryKerjasama.create({
          data: {
            permohonanId: id,
            statusLama: existing.status,
            ...historyData
          }
        });
        return item;
      });
    } else {
      return NextResponse.json({ message: "Jenis permohonan tidak valid." }, { status: 400 });
    }

    if (existing.status !== updated.status || body.pesan_pemohon) {
      if (updated.status === "disetujui") {
        if (jenis === "liputan") {
          await Promise.all([
            sendPermohonanDisetujuiEmail({
              email: updated.email,
              namaAcara: updated.namaAcara,
              tempatAcara: updated.tempatAcara,
              tanggalAcara: updated.tanggalAcara,
              pesan: body.pesan_pemohon
            }).catch((error) => console.error("Gagal mengirim email disetujui:", error)),
            sendWaToUser({
              noWa: updated.noWa,
              namaAcara: updated.namaAcara,
              tempatAcara: updated.tempatAcara,
              tanggalAcara: updated.tanggalAcara,
              pesan: body.pesan_pemohon
            }).catch((error) => console.error("Gagal mengirim WA ke user:", error))
          ]);
        } else if (jenis === "media_partner") {
          await sendWaMediaPartnerToUser({
            noWa: extractWaFromKontak(updated.kontakPenanggungJawab),
            namaAcara: updated.namaAcara,
            tanggalRequestUpload: updated.tanggalRequestUpload,
            pesan: body.pesan_pemohon
          }).catch((error) => console.error("Gagal mengirim WA ke user:", error));
        } else {
          await sendWaKerjasamaToUser({
            noWa: extractWaFromKontak(updated.kontakPenanggungJawab),
            namaAcara: updated.namaAcara,
            tanggalRequestUpload: updated.tanggalRequestUpload,
            pesan: body.pesan_pemohon
          }).catch((error) => console.error("Gagal mengirim WA ke user:", error));
        }
      } else if (jenis === "liputan") {
        await sendStatusChangedEmail({
          email: updated.email,
          nomorRujukan: updated.nomorRujukan,
          status: updated.status,
          pesan: body.pesan_pemohon
        }).catch((error) => console.error("Gagal mengirim email status:", error));
      }
    }

    return NextResponse.json({ permohonan: updated });
  } catch {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }
}

function extractWaFromKontak(kontak: string): string {
  const match = kontak.match(/\+?\d[\d\s-]{7,}/);
  return match ? match[0].replace(/[\s-]/g, "") : kontak;
}