import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateNomorRujukan } from "@/lib/reference";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isAllowedCampusEmail, normalizeEmail } from "@/lib/env";
import { saveUploadedFile } from "@/lib/upload";
import { sendPermohonanDiterimaEmail } from "@/lib/email";
import { sendWaGroupNotificationPeminjamanPodcast } from "@/lib/wa";

const PODCAST_MAX_MB = 10;
const PODCAST_MAX_BYTES = PODCAST_MAX_MB * 1024 * 1024;

const schema = z.object({
  nama_instansi: z.string().min(2, "Nama organisasi/instansi wajib diisi."),
  nama_acara: z.string().min(2, "Nama acara/tujuan peminjaman wajib diisi."),
  tanggal_peminjaman: z.string().min(1, "Tanggal peminjaman wajib diisi."),
  waktu_mulai: z.string().min(1, "Waktu mulai wajib diisi."),
  waktu_selesai: z.string().min(1, "Waktu selesai wajib diisi."),
  kontak_penanggung_jawab: z.string().min(2, "Kontak penanggung jawab wajib diisi."),
  note_detail: z.string().min(2, "Note detail wajib diisi."),
  email: z.string().email("Email tidak valid.")
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`permohonan-peminjaman-podcast:${ip}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const payload = schema.parse({
      nama_instansi: formData.get("nama_instansi"),
      nama_acara: formData.get("nama_acara"),
      tanggal_peminjaman: formData.get("tanggal_peminjaman"),
      waktu_mulai: formData.get("waktu_mulai"),
      waktu_selesai: formData.get("waktu_selesai"),
      kontak_penanggung_jawab: formData.get("kontak_penanggung_jawab"),
      note_detail: formData.get("note_detail"),
      email: formData.get("email")
    });

    const email = normalizeEmail(payload.email);
    if (!isAllowedCampusEmail(email)) {
      return NextResponse.json(
        { message: "Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id." },
        { status: 400 }
      );
    }

    const fileRekom = formData.get("surat_rekom_bakk");
    const filePernyataan = formData.get("surat_pernyataan");
    if (!(fileRekom instanceof File)) {
      return NextResponse.json({ message: "Surat rekomendasi BAKK wajib diunggah." }, { status: 400 });
    }
    if (!(filePernyataan instanceof File)) {
      return NextResponse.json({ message: "Surat pernyataan wajib diunggah." }, { status: 400 });
    }

    const [rekom, pernyataan] = await Promise.all([
      saveUploadedFile(fileRekom, { pdfOnly: true, maxSizeBytes: PODCAST_MAX_BYTES }),
      saveUploadedFile(filePernyataan, { pdfOnly: true, maxSizeBytes: PODCAST_MAX_BYTES })
    ]);

    let nomorRujukan = await generateNomorRujukan("PP");

    const permohonan = await prisma.$transaction(async (tx) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const created = await tx.permohonanPeminjamanPodcast.create({
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
          });
          return created;
        } catch (error: any) {
          if (error?.code !== "P2002") throw error;
          nomorRujukan = await generateNomorRujukan("PP");
        }
      }
      throw new Error("Nomor rujukan gagal dibuat. Coba lagi.");
    });

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
      kontakPenanggungJawab: permohonan.kontakPenanggungJawab,
      noteDetail: permohonan.noteDetail,
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