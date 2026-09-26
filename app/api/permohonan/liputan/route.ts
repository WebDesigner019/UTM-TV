import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isAllowedCampusEmail, normalizeEmail } from "@/lib/env";
import { saveUploadedFile } from "@/lib/upload";
import { sendPermohonanDiterimaEmail } from "@/lib/email";
import { sendWaGroupNotification } from "@/lib/wa";
import { PERMOHONAN_FORM } from "@/lib/permohonan-form";
import { parsePayload, pickFiles, skemaPermohonan } from "@/lib/permohonan-schema";
import { createWithNomorRujukan } from "@/lib/permohonan-create";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`permohonan:${ip}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const payload = parsePayload(formData, skemaPermohonan.liputan) as {
      nama_instansi: string;
      email: string;
      no_wa: string;
      nama_acara: string;
      tanggal_acara: string;
      tempat_acara: string;
      detail_peserta_audiens?: string;
    };

    const email = normalizeEmail(payload.email);
    if (!isAllowedCampusEmail(email)) {
      return NextResponse.json(
        { message: "Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id." },
        { status: 400 }
      );
    }

    const [file] = pickFiles(formData, "liputan");
    const uploaded = await saveUploadedFile(file);

    const permohonan = await createWithNomorRujukan(PERMOHONAN_FORM.liputan.prefix, (nomorRujukan) =>
      prisma.$transaction(async (tx) =>
        tx.permohonanLiputan.create({
          data: {
            nomorRujukan,
            namaInstansi: payload.nama_instansi,
            email,
            noWa: payload.no_wa,
            namaAcara: payload.nama_acara,
            tanggalAcara: new Date(payload.tanggal_acara),
            tempatAcara: payload.tempat_acara,
            detailPesertaAudiens: payload.detail_peserta_audiens || null,
            filePath: uploaded.relativePath,
            fileOriginalName: uploaded.originalName,
            fileMimeType: uploaded.mimeType,
            fileSizeBytes: uploaded.sizeBytes,
            status: "diterima",
            statusHistory: {
              create: {
                statusLama: null,
                statusBaru: "diterima",
                pesan: "Permohonan diterima oleh sistem."
              }
            }
          }
        })
      )
    );

    await sendPermohonanDiterimaEmail({
      email,
      nomorRujukan: permohonan.nomorRujukan,
      namaAcara: permohonan.namaAcara,
      jenis: "liputan"
    }).catch((error) => console.error("Gagal mengirim email diterima:", error));

    await sendWaGroupNotification({
      namaInstansi: permohonan.namaInstansi,
      namaAcara: permohonan.namaAcara,
      tempatAcara: permohonan.tempatAcara,
      tanggalAcara: permohonan.tanggalAcara,
      detailPesertaAudiens: permohonan.detailPesertaAudiens,
      noWa: permohonan.noWa ?? "",
      email: permohonan.email ?? ""
    }).catch((error) => console.error("Gagal mengirim notifikasi WA grup:", error));

    return NextResponse.json({ nomor_rujukan: permohonan.nomorRujukan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message || "Data tidak valid." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Permohonan gagal dikirim.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
