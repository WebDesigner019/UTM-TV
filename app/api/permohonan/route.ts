import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateNomorRujukan } from "@/lib/reference";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isAllowedCampusEmail, normalizeEmail } from "@/lib/env";
import { saveUploadedFile } from "@/lib/upload";
import { sendPermohonanDiterimaEmail } from "@/lib/email";
import { sendWaGroupNotification } from "@/lib/wa";

const schema = z.object({
  nama_instansi: z.string().min(2, "Nama instansi wajib diisi."),
  email: z.string().email("Email tidak valid."),
  no_wa: z.string().min(1, "No. WhatsApp wajib diisi."),
  nama_acara: z.string().min(2, "Nama acara wajib diisi."),
  tanggal_acara: z.string().min(1, "Tanggal acara wajib diisi."),
  tempat_acara: z.string().min(2, "Tempat acara wajib diisi.")
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`permohonan:${ip}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const payload = schema.parse({
      nama_instansi: formData.get("nama_instansi"),
      email: formData.get("email"),
      no_wa: formData.get("no_wa"),
      nama_acara: formData.get("nama_acara"),
      tanggal_acara: formData.get("tanggal_acara"),
      tempat_acara: formData.get("tempat_acara")
    });

    const email = normalizeEmail(payload.email);
    if (!isAllowedCampusEmail(email)) {
      return NextResponse.json(
        { message: "Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id." },
        { status: 400 }
      );
    }

    const file = formData.get("surat_pengajuan");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Surat pengajuan wajib diunggah." }, { status: 400 });
    }

    const uploaded = await saveUploadedFile(file);
    let nomorRujukan = await generateNomorRujukan();

    const permohonan = await prisma.$transaction(async (tx) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const created = await tx.permohonan.create({
            data: {
              nomorRujukan,
              namaInstansi: payload.nama_instansi,
              email,
              noWa: payload.no_wa,
              namaAcara: payload.nama_acara,
              tanggalAcara: new Date(payload.tanggal_acara),
              tempatAcara: payload.tempat_acara,
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
          nomorRujukan = await generateNomorRujukan();
        }
      }
      throw new Error("Nomor rujukan gagal dibuat. Coba lagi.");
    });

    await sendPermohonanDiterimaEmail({
      email,
      nomorRujukan: permohonan.nomorRujukan,
      namaAcara: permohonan.namaAcara
    }).catch((error) => console.error("Gagal mengirim email diterima:", error));

    await sendWaGroupNotification({
      namaInstansi: permohonan.namaInstansi,
      namaAcara: permohonan.namaAcara,
      tempatAcara: permohonan.tempatAcara,
      tanggalAcara: permohonan.tanggalAcara,
      noWa: permohonan.noWa,
      email: permohonan.email
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
