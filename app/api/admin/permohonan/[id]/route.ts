import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS, type JenisPermohonan } from "@/lib/status";
import { sendStatusChangedEmail, sendPermohonanDisetujuiEmail } from "@/lib/email";
import {
  sendWaToUser,
  sendWaMediaPartnerToUser,
  sendWaKerjasamaToUser,
  sendWaPeminjamanPodcastToUser,
  sendWaStatusChangedToUser
} from "@/lib/wa";

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
  } else if (jenis === "peminjaman_podcast") {
    permohonan = await prisma.permohonanPeminjamanPodcast.findUnique({
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
    } else if (jenis === "peminjaman_podcast") {
      existing = await prisma.permohonanPeminjamanPodcast.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
      updated = await prisma.$transaction(async (tx) => {
        const item = await tx.permohonanPeminjamanPodcast.update({
          where: { id },
          data: {
            status: body.status,
            pesanPemohon: body.pesan_pemohon || null,
            catatanInternal: body.catatan_internal || null
          }
        });
        await tx.statusHistoryPeminjamanPodcast.create({
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

    // Data yang dicatat manual oleh admin tidak punya email maupun nomor
    // WhatsApp, dan sesuai requirement tidak pernah mengirim notifikasi.
    const bolehNotifikasi = !existing.inputManuallyEntered;

    if (bolehNotifikasi && (existing.status !== updated.status || body.pesan_pemohon)) {
      const jenisTyped = jenis as JenisPermohonan;
      const noWa: string | null =
        jenis === "liputan"
          ? updated.noWa ?? null
          : extractWaFromKontak(updated.kontakPenanggungJawab);
      const email: string | null = updated.email ?? null;

      const tasks: Promise<unknown>[] = [];

      if (updated.status === "disetujui") {
        if (email) {
          tasks.push(
            sendPermohonanDisetujuiEmail({
              email,
              jenis: jenisTyped,
              namaAcara: updated.namaAcara,
              tempatAcara: updated.tempatAcara,
              tanggalAcara: updated.tanggalAcara,
              tanggalRequestUpload: updated.tanggalRequestUpload,
              tanggalPeminjaman: updated.tanggalPeminjaman,
              waktuMulai: updated.waktuMulai,
              waktuSelesai: updated.waktuSelesai,
              pesan: body.pesan_pemohon
            }).catch((error) => console.error("Gagal mengirim email disetujui:", error))
          );
        }

        if (noWa) {
          const pesan = body.pesan_pemohon;
          const namaAcara = updated.namaAcara;
          const waTask =
            jenis === "liputan"
              ? sendWaToUser({
                  noWa,
                  namaAcara,
                  tempatAcara: updated.tempatAcara,
                  tanggalAcara: updated.tanggalAcara,
                  pesan
                })
              : jenis === "media_partner"
                ? sendWaMediaPartnerToUser({
                    noWa,
                    namaAcara,
                    tanggalRequestUpload: updated.tanggalRequestUpload,
                    pesan
                  })
                : jenis === "peminjaman_podcast"
                  ? sendWaPeminjamanPodcastToUser({
                      noWa,
                      namaAcara,
                      tanggalPeminjaman: updated.tanggalPeminjaman,
                      waktuMulai: updated.waktuMulai,
                      waktuSelesai: updated.waktuSelesai,
                      pesan
                    })
                  : sendWaKerjasamaToUser({
                      noWa,
                      namaAcara,
                      tanggalRequestUpload: updated.tanggalRequestUpload,
                      pesan
                    });
          tasks.push(waTask.catch((error) => console.error("Gagal mengirim WA ke user:", error)));
        }
      } else {
        if (email) {
          tasks.push(
            sendStatusChangedEmail({
              email,
              nomorRujukan: updated.nomorRujukan,
              status: updated.status,
              pesan: body.pesan_pemohon,
              jenis: jenisTyped
            }).catch((error) => console.error("Gagal mengirim email status:", error))
          );
        }

        if (noWa) {
          tasks.push(
            sendWaStatusChangedToUser({
              noWa,
              jenis: jenisTyped,
              status: updated.status,
              namaAcara: updated.namaAcara,
              pesan: body.pesan_pemohon
            }).catch((error) => console.error("Gagal mengirim WA status:", error))
          );
        }
      }

      await Promise.all(tasks);
    }

    return NextResponse.json({ permohonan: updated });
  } catch {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }
}

function extractWaFromKontak(kontak: string | null | undefined): string | null {
  if (!kontak) return null;
  const match = kontak.match(/\+?\d[\d\s-]{7,}/);
  return match ? match[0].replace(/[\s-]/g, "") : kontak;
}