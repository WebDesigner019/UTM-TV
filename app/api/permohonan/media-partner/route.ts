import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateNomorRujukan } from "@/lib/reference";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isAllowedCampusEmail, normalizeEmail } from "@/lib/env";
import { saveUploadedFile } from "@/lib/upload";
import { sendPermohonanDiterimaEmail } from "@/lib/email";
import { sendWaGroupNotificationMediaPartner } from "@/lib/wa";

const schema = z.object({
  fakultas_organisasi: z.string().min(2, "Fakultas/Organisasi/Unit wajib diisi."),
  email: z.string().email("Email tidak valid."),
  nama_acara: z.string().min(2, "Nama acara wajib diisi."),
  tanggal_request_upload: z.string().min(1, "Hari dan tanggal request upload wajib diisi."),
  kontak_penanggung_jawab: z.string().min(2, "Kontak penanggung jawab wajib diisi.")
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`permohonan-media-partner:${ip}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const payload = schema.parse({
      fakultas_organisasi: formData.get("fakultas_organisasi"),
      email: formData.get("email"),
      nama_acara: formData.get("nama_acara"),
      tanggal_request_upload: formData.get("tanggal_request_upload"),
      kontak_penanggung_jawab: formData.get("kontak_penanggung_jawab")
    });

    const email = normalizeEmail(payload.email);
    if (!isAllowedCampusEmail(email)) {
      return NextResponse.json(
        { message: "Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id." },
        { status: 400 }
      );
    }

    const file = formData.get("surat_media_partner");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Surat permohonan media partner wajib diunggah." }, { status: 400 });
    }

    const uploaded = await saveUploadedFile(file);
    let nomorRujukan = await generateNomorRujukan("MP");

    const permohonan = await prisma.$transaction(async (tx) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const created = await tx.permohonanMediaPartner.create({
            data: {
              nomorRujukan,
              fakultasOrganisasi: payload.fakultas_organisasi,
              email,
              namaAcara: payload.nama_acara,
              tanggalRequestUpload: new Date(payload.tanggal_request_upload),
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
          });
          return created;
        } catch (error: any) {
          if (error?.code !== "P2002") throw error;
          nomorRujukan = await generateNomorRujukan("MP");
        }
      }
      throw new Error("Nomor rujukan gagal dibuat. Coba lagi.");
    });

    await sendPermohonanDiterimaEmail({
      email,
      nomorRujukan: permohonan.nomorRujukan,
      namaAcara: permohonan.namaAcara,
      jenis: "media_partner"
    }).catch((error) => console.error("Gagal mengirim email diterima:", error));

    await sendWaGroupNotificationMediaPartner({
      fakultasOrganisasi: permohonan.fakultasOrganisasi,
      namaAcara: permohonan.namaAcara,
      tanggalRequestUpload: permohonan.tanggalRequestUpload,
      kontakPenanggungJawab: permohonan.kontakPenanggungJawab
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