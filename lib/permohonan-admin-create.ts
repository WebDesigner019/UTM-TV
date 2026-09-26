import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS, type JenisPermohonan } from "@/lib/status";
import { PERMOHONAN_FORM } from "@/lib/permohonan-form";
import { getSkemaAdmin, parsePayload } from "@/lib/permohonan-schema";
import { createWithNomorRujukan } from "@/lib/permohonan-create";

const statusAwalSchema = z.enum(["diterima", "disetujui", "ditolak", "selesai"]);

export class PermohonanCreateError extends Error {}

/**
 * Membuat satu record permohonan atas nama admin.
 *
 * Berbeda dengan alur publik: tidak ada email, tidak ada nomor WhatsApp, tidak
 * ada lampiran surat, tidak ada validasi domain kampus, dan tidak ada email
 * maupun notifikasi WhatsApp yang dikirim. Karena itu kolom file_* dibiarkan
 * null dan kolom kontak diisi null.
 *
 * Record ditandai input_manually_entered supaya notifikasi pada perubahan
 * status berikutnya juga dilewati.
 */
export async function createPermohonanByAdmin(input: {
  jenis: JenisPermohonan;
  formData: FormData;
  admin: { id: number; nama: string };
}): Promise<{ id: number; nomorRujukan: string; jenis: JenisPermohonan }> {
  const { jenis, formData, admin } = input;
  const config = PERMOHONAN_FORM[jenis];

  const statusAwal = statusAwalSchema.safeParse(formData.get("status_awal") ?? "diterima");
  if (!statusAwal.success || !STATUS_OPTIONS.includes(statusAwal.data)) {
    throw new PermohonanCreateError("Status awal tidak valid.");
  }

  const payload = parsePayload(formData, getSkemaAdmin(jenis)) as Record<string, string>;

  const initialHistory = {
    statusLama: null,
    statusBaru: statusAwal.data,
    changedByAdminId: admin.id,
    pesan: `Dicatat manual oleh admin: ${admin.nama}`
  };

  if (jenis === "liputan") {
    const created = await createWithNomorRujukan(config.prefix, (nomorRujukan) =>
      prisma.permohonanLiputan.create({
        data: {
          nomorRujukan,
          namaInstansi: payload.nama_instansi,
          email: null,
          noWa: null,
          namaAcara: payload.nama_acara,
          tanggalAcara: new Date(payload.tanggal_acara),
          tempatAcara: payload.tempat_acara,
          detailPesertaAudiens: payload.detail_peserta_audiens || null,
          status: statusAwal.data,
          inputManuallyEntered: true,
          statusHistory: { create: initialHistory }
        }
      })
    );
    return { id: created.id, nomorRujukan: created.nomorRujukan, jenis };
  }

  if (jenis === "media_partner" || jenis === "kerjasama") {
    // tanggal_request_upload wajib untuk media partner dan opsional untuk
    // kerjasama, serta kolomnya nullable hanya di tabel kerjasama. Karena itu
    // kedua cabang tetap terpisah meski datanya sebagian besar sama.
    const dasar = {
      fakultasOrganisasi: payload.fakultas_organisasi,
      email: null,
      namaAcara: payload.nama_acara,
      kontakPenanggungJawab: payload.kontak_penanggung_jawab,
      status: statusAwal.data,
      inputManuallyEntered: true,
      statusHistory: { create: initialHistory }
    };

    const created =
      jenis === "media_partner"
        ? await createWithNomorRujukan(config.prefix, (nomorRujukan) =>
            prisma.permohonanMediaPartner.create({
              data: {
                ...dasar,
                nomorRujukan,
                tanggalRequestUpload: new Date(payload.tanggal_request_upload)
              }
            })
          )
        : await createWithNomorRujukan(config.prefix, (nomorRujukan) =>
            prisma.permohonanKerjasama.create({
              data: {
                ...dasar,
                nomorRujukan,
                tanggalRequestUpload: payload.tanggal_request_upload
                  ? new Date(payload.tanggal_request_upload)
                  : null
              }
            })
          );

    return { id: created.id, nomorRujukan: created.nomorRujukan, jenis };
  }

  const created = await createWithNomorRujukan(config.prefix, (nomorRujukan) =>
    prisma.permohonanPeminjamanPodcast.create({
      data: {
        nomorRujukan,
        namaInstansi: payload.nama_instansi,
        namaAcara: payload.nama_acara,
        tanggalPeminjaman: new Date(payload.tanggal_peminjaman),
        waktuMulai: payload.waktu_mulai,
        waktuSelesai: payload.waktu_selesai,
        kontakPenanggungJawab: payload.kontak_penanggung_jawab,
        noteDetail: payload.note_detail,
        email: null,
        status: statusAwal.data,
        inputManuallyEntered: true,
        statusHistory: { create: initialHistory }
      }
    })
  );

  return { id: created.id, nomorRujukan: created.nomorRujukan, jenis };
}
