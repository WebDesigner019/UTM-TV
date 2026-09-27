import type { StatusPermohonan } from "@prisma/client";
import { sendPermohonanDiperbaruiEmail, sendPermohonanDisetujuiEmail, sendStatusChangedEmail } from "@/lib/email";
import {
  sendWaDataDiperbaruiToUser,
  sendWaKerjasamaToUser,
  sendWaMediaPartnerToUser,
  sendWaPeminjamanPodcastToUser,
  sendWaStatusChangedToUser,
  sendWaToUser
} from "@/lib/wa";
import { extractNomorWa } from "@/lib/permohonan-record";
import type { JenisPermohonan } from "@/lib/status";

/** Ringkasan channel yang benar-benar terkirim, untuk ditampilkan ke admin. */
export type HasilNotifikasi = "email" | "whatsapp" | "email dan whatsapp" | "tidak ada kontak" | "dilewati";

/**
 * Kontak pemohon pada sebuah record.
 *
 * Hanya liputan punya kolom no_wa. Tiga jenis lainnya menyimpan satu field
 * bebas teks berisi nama dan nomor, jadi nomornya diekstrak best effort.
 */
function kontakPemohon(jenis: JenisPermohonan, record: Record<string, any>) {
  return {
    email: (record.email as string | null) ?? null,
    noWa: jenis === "liputan" ? ((record.noWa as string | null) ?? null) : extractNomorWa(record.kontakPenanggungJawab)
  };
}

/**
 * Notifikasi setelah status berubah. Dipakai oleh PATCH.
 *
 * Diberi tahu hanya bila status benar-benar berubah atau admin menulis pesan
 * pemohon, jadi sekadar menyimpan catatan internal tidak membanjiri pemohon.
 */
export async function kirimNotifikasiStatus(input: {
  jenis: JenisPermohonan;
  record: Record<string, any>;
  status: StatusPermohonan;
  pesan?: string | null;
}): Promise<HasilNotifikasi> {
  const { jenis, record, status, pesan } = input;
  const { email, noWa } = kontakPemohon(jenis, record);
  if (!email && !noWa) return "tidak ada kontak";

  const tasks: Promise<unknown>[] = [];

  if (status === "disetujui") {
    if (email) {
      tasks.push(
        sendPermohonanDisetujuiEmail({
          email,
          jenis,
          namaAcara: record.namaAcara,
          tempatAcara: record.tempatAcara,
          tanggalAcara: record.tanggalAcara,
          tanggalRequestUpload: record.tanggalRequestUpload,
          tanggalPeminjaman: record.tanggalPeminjaman,
          waktuMulai: record.waktuMulai,
          waktuSelesai: record.waktuSelesai,
          pesan
        }).catch((error) => console.error("Gagal mengirim email disetujui:", error))
      );
    }

    if (noWa) {
      const namaAcara = record.namaAcara;
      const waTask =
        jenis === "liputan"
          ? sendWaToUser({
              noWa,
              namaAcara,
              tempatAcara: record.tempatAcara,
              tanggalAcara: record.tanggalAcara,
              pesan
            })
          : jenis === "media_partner"
            ? sendWaMediaPartnerToUser({
                noWa,
                namaAcara,
                tanggalRequestUpload: record.tanggalRequestUpload,
                pesan
              })
            : jenis === "peminjaman_podcast"
              ? sendWaPeminjamanPodcastToUser({
                  noWa,
                  namaAcara,
                  tanggalPeminjaman: record.tanggalPeminjaman,
                  waktuMulai: record.waktuMulai,
                  waktuSelesai: record.waktuSelesai,
                  pesan
                })
              : sendWaKerjasamaToUser({
                  noWa,
                  namaAcara,
                  tanggalRequestUpload: record.tanggalRequestUpload,
                  pesan
                });
      tasks.push(waTask.catch((error) => console.error("Gagal mengirim WA ke user:", error)));
    }
  } else {
    if (email) {
      tasks.push(
        sendStatusChangedEmail({
          email,
          nomorRujukan: record.nomorRujukan,
          status,
          jenis,
          pesan
        }).catch((error) => console.error("Gagal mengirim email status:", error))
      );
    }

    if (noWa) {
      tasks.push(
        sendWaStatusChangedToUser({
          noWa,
          jenis,
          status,
          namaAcara: record.namaAcara,
          pesan
        }).catch((error) => console.error("Gagal mengirim WA status:", error))
      );
    }
  }

  await Promise.all(tasks);
  return hasilChannel(Boolean(email), Boolean(noWa));
}

/**
 * Notifikasi setelah admin mengubah data. Dipakai oleh PUT.
 *
 * Kontak diambil dari record yang sudah diperbarui, jadi ketika admin memperbaiki
 * email atau nomor WhatsApp, pemberitahuan dikirim ke kontak yang baru. Pemohon
 * lama sengaja tidak diberi tahu karena alamat lamanya sudah tidak berlaku.
 */
export async function kirimNotifikasiPerubahan(input: {
  jenis: JenisPermohonan;
  record: Record<string, any>;
  perubahan: { label: string; dari: string; ke: string }[];
}): Promise<HasilNotifikasi> {
  const { jenis, record, perubahan } = input;
  const { email, noWa } = kontakPemohon(jenis, record);
  if (!email && !noWa) return "tidak ada kontak";
  if (perubahan.length === 0) return "dilewati";

  const tasks: Promise<unknown>[] = [];

  if (email) {
    tasks.push(
      sendPermohonanDiperbaruiEmail({
        email,
        nomorRujukan: record.nomorRujukan,
        jenis,
        namaAcara: record.namaAcara,
        perubahan
      }).catch((error) => console.error("Gagal mengirim email perubahan data:", error))
    );
  }

  if (noWa) {
    tasks.push(
      sendWaDataDiperbaruiToUser({
        noWa,
        jenis,
        nomorRujukan: record.nomorRujukan,
        namaAcara: record.namaAcara,
        perubahan
      }).catch((error) => console.error("Gagal mengirim WA perubahan data:", error))
    );
  }

  await Promise.all(tasks);
  return hasilChannel(Boolean(email), Boolean(noWa));
}

function hasilChannel(kirimEmail: boolean, kirimWa: boolean): HasilNotifikasi {
  if (kirimEmail && kirimWa) return "email dan whatsapp";
  return kirimEmail ? "email" : "whatsapp";
}
