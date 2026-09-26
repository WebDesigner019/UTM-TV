import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isAllowedCampusEmail, normalizeEmail } from "@/lib/env";
import { saveUploadedFile } from "@/lib/upload";
import { sendPermohonanDiterimaEmail } from "@/lib/email";
import { sendWaGroupNotificationPeminjamanPodcast } from "@/lib/wa";
import { PERMOHONAN_FORM, getFileFields } from "@/lib/permohonan-form";
import { parsePayload, pickFiles, skemaPermohonan } from "@/lib/permohonan-schema";
import { createWithNomorRujukan } from "@/lib/permohonan-create";
import type { UploadOptions } from "@/lib/upload";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`permohonan-peminjaman-podcast:${ip}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const payload = parsePayload(formData, skemaPermohonan.peminjaman_podcast) as {
      nama_instansi: string;
      nama_acara: string;
      tanggal_peminjaman: string;
      waktu_mulai: string;
      waktu_selesai: string;
      kontak_penanggung_jawab: string;
      note_detail: string;
      email: string;
    };

    const email = normalizeEmail(payload.email);
    if (!isAllowedCampusEmail(email)) {
      return NextResponse.json(
        { message: "Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id." },
        { status: 400 }
      );
    }

    const files = pickFiles(formData, "peminjaman_podcast");
    const fileFields = getFileFields("peminjaman_podcast");
    const options: UploadOptions = { pdfOnly: fileFields.every((field) => field.pdfOnly) };
    const [rekom, pernyataan] = await Promise.all([
      saveUploadedFile(files[0], options),
      saveUploadedFile(files[1], options)
    ]);

    const permohonan = await createWithNomorRujukan(
      PERMOHONAN_FORM.peminjaman_podcast.prefix,
      async (nomorRujukan) =>
        prisma.$transaction(async (tx) =>
          tx.permohonanPeminjamanPodcast.create({
            data: {
              nomorRujukan,
              namaInstansi: payload.nama_instansi,
              namaAcara: payload.nama_acara,
              tanggalPeminjaman: new Date(payload.tanggal_peminjaman),
              waktuMulai: payload.waktu_mulai,
              waktuSelesai: payload.waktu_selesai,
              kontakPenanggungJawab: payload.kontak_penanggung_jawab,
              noteDetail: payload.note_detail,
              email,
              fileRekomBakkPath: rekom.relativePath,
              fileRekomBakkOriginalName: rekom.originalName,
              fileRekomBakkMimeType: rekom.mimeType,
              fileRekomBakkSizeBytes: rekom.sizeBytes,
              filePernyataanPath: pernyataan.relativePath,
              filePernyataanOriginalName: pernyataan.originalName,
              filePernyataanMimeType: pernyataan.mimeType,
              filePernyataanSizeBytes: pernyataan.sizeBytes,
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
      jenis: "peminjaman_podcast"
    }).catch((error) => console.error("Gagal mengirim email diterima:", error));

    await sendWaGroupNotificationPeminjamanPodcast({
      namaInstansi: permohonan.namaInstansi,
      namaAcara: permohonan.namaAcara,
      tanggalPeminjaman: permohonan.tanggalPeminjaman,
      waktuMulai: permohonan.waktuMulai,
      waktuSelesai: permohonan.waktuSelesai,
      kontakPenanggungJawab: payload.kontak_penanggung_jawab,
      noteDetail: permohonan.noteDetail,
      email
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
