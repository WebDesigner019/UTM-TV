import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isAllowedCampusEmail, normalizeEmail } from "@/lib/env";
import { saveUploadedFile } from "@/lib/upload";
import { sendPermohonanDiterimaEmail } from "@/lib/email";
import { sendWaGroupNotificationKerjasama } from "@/lib/wa";
import { PERMOHONAN_FORM } from "@/lib/permohonan-form";
import { parsePayload, pickFiles, skemaPermohonan } from "@/lib/permohonan-schema";
import { createWithNomorRujukan } from "@/lib/permohonan-create";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`permohonan-kerjasama:${ip}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const payload = parsePayload(formData, skemaPermohonan.kerjasama) as {
      fakultas_organisasi: string;
      email: string;
      nama_acara: string;
      tanggal_request_upload?: string;
      kontak_penanggung_jawab: string;
    };

    const email = normalizeEmail(payload.email);
    if (!isAllowedCampusEmail(email)) {
      return NextResponse.json(
        { message: "Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id." },
        { status: 400 }
      );
    }

    const [file] = pickFiles(formData, "kerjasama");
    const uploaded = await saveUploadedFile(file);

    const permohonan = await createWithNomorRujukan(PERMOHONAN_FORM.kerjasama.prefix, async (nomorRujukan) =>
      prisma.$transaction(async (tx) =>
        tx.permohonanKerjasama.create({
          data: {
            nomorRujukan,
            fakultasOrganisasi: payload.fakultas_organisasi,
            email,
            namaAcara: payload.nama_acara,
            tanggalRequestUpload: payload.tanggal_request_upload
              ? new Date(payload.tanggal_request_upload)
              : null,
            kontakPenanggungJawab: payload.kontak_penanggung_jawab,
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
      jenis: "kerjasama"
    }).catch((error) => console.error("Gagal mengirim email diterima:", error));

    await sendWaGroupNotificationKerjasama({
      fakultasOrganisasi: permohonan.fakultasOrganisasi,
      namaAcara: permohonan.namaAcara,
      tanggalRequestUpload: permohonan.tanggalRequestUpload,
      kontakPenanggungJawab: payload.kontak_penanggung_jawab
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
