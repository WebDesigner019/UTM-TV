import type { StatusPermohonan } from "@prisma/client";
import { JENIS_LABEL, type JenisPermohonan, STATUS_LABEL, formatTanggal } from "@/lib/status";

const FONNTE_API = "https://api.fonnte.com/send";

async function sendFonnte(token: string, target: string, message: string) {
  const response = await fetch(FONNTE_API, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target,
      message,
      type: "text"
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[WA GAGAL]", response.status, body);
  }
}

export async function sendWaToUser(input: {
  noWa: string;
  namaAcara: string;
  tempatAcara: string;
  tanggalAcara: Date;
  waktuAcara?: string | null;
  pesan?: string | null;
}) {
  const token = process.env.FONNTE_WA_API;
  if (!token) {
    console.log("[WA SIMULASI] Token tidak dikonfigurasi.");
    return;
  }

  const tanggal = formatTanggal(input.tanggalAcara);
  const keterangan = input.pesan || "-";

  const message = [
    `Hi Tretan COMPACT!👋`,
    `pengajuan liputan anda telah disetujui:`,
    `nama acara: ${input.namaAcara}`,
    `tempat: ${input.tempatAcara}`,
    `tanggal: ${tanggal}`,
    // Baris waktu hanya muncul kalau pemohon mengisinya, supaya pesan tidak
    // memunculkan "waktu: -" untuk pengajuan yang jadwalnya memang belum pasti.
    ...(input.waktuAcara ? [`waktu: ${input.waktuAcara}`] : []),
    `status: disetujui`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat COMPACT.`
  ].join("\n");

  await sendFonnte(token, input.noWa, message);
}

export async function sendWaMediaPartnerToUser(input: {
  noWa: string;
  namaAcara: string;
  tanggalRequestUpload?: Date | null;
  pesan?: string | null;
}) {
  const token = process.env.FONNTE_WA_API;
  if (!token) {
    console.log("[WA SIMULASI] Token tidak dikonfigurasi.");
    return;
  }

  const tanggal = input.tanggalRequestUpload ? formatTanggal(input.tanggalRequestUpload) : "-";
  const keterangan = input.pesan || "-";

  const message = [
    `Hi Tretan COMPACT!👋`,
    `pengajuan media partner anda telah disetujui:`,
    `nama acara: ${input.namaAcara}`,
    `tanggal request upload: ${tanggal}`,
    `status: disetujui`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat COMPACT.`
  ].join("\n");

  await sendFonnte(token, input.noWa, message);
}

export async function sendWaKerjasamaToUser(input: {
  noWa: string;
  namaAcara: string;
  tanggalRequestUpload?: Date | null;
  pesan?: string | null;
}) {
  const token = process.env.FONNTE_WA_API;
  if (!token) {
    console.log("[WA SIMULASI] Token tidak dikonfigurasi.");
    return;
  }

  const tanggal = input.tanggalRequestUpload ? formatTanggal(input.tanggalRequestUpload) : "-";
  const keterangan = input.pesan || "-";

  const message = [
    `Hi Tretan COMPACT!👋`,
    `pengajuan kerjasama anda telah disetujui:`,
    `nama acara: ${input.namaAcara}`,
    `tanggal request upload: ${tanggal}`,
    `status: disetujui`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat COMPACT.`
  ].join("\n");

  await sendFonnte(token, input.noWa, message);
}

export async function sendWaPeminjamanPodcastToUser(input: {
  noWa: string;
  namaAcara: string;
  tanggalPeminjaman: Date;
  waktuMulai: string;
  waktuSelesai: string;
  pesan?: string | null;
}) {
  const token = process.env.FONNTE_WA_API;
  if (!token) {
    console.log("[WA SIMULASI] Token tidak dikonfigurasi.");
    return;
  }

  const keterangan = input.pesan || "-";

  const message = [
    `Hi Tretan COMPACT!👋`,
    `pengajuan peminjaman ruang podcast anda telah disetujui:`,
    `nama acara: ${input.namaAcara}`,
    `tanggal: ${formatTanggal(input.tanggalPeminjaman)}`,
    `waktu: ${input.waktuMulai} - ${input.waktuSelesai}`,
    `status: disetujui`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat COMPACT.`
  ].join("\n");

  await sendFonnte(token, input.noWa, message);
}

export async function sendWaStatusChangedToUser(input: {
  noWa: string;
  jenis: JenisPermohonan;
  status: StatusPermohonan;
  namaAcara: string;
  pesan?: string | null;
}) {
  const token = process.env.FONNTE_WA_API;
  if (!token) {
    console.log("[WA SIMULASI] Token tidak dikonfigurasi.");
    return;
  }

  const jenisLabel = JENIS_LABEL[input.jenis];
  const statusLabel = STATUS_LABEL[input.status];
  const keterangan = input.pesan || "-";

  const message = [
    `Hi Tretan COMPACT!👋`,
    `status pengajuan ${jenisLabel} anda telah diperbarui.`,
    `nama acara: ${input.namaAcara}`,
    `status: ${statusLabel}`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat COMPACT.`
  ].join("\n");

  await sendFonnte(token, input.noWa, message);
}

/**
 * WhatsApp untuk perubahan data oleh admin.
 *
 * Isinya daftar field yang berubah, bukan sekadar "data diperbarui", supaya
 * pemohon tahu persis apa yang dikoreksi tanpa perlu membuka email.
 */
export async function sendWaDataDiperbaruiToUser(input: {
  noWa: string;
  jenis: JenisPermohonan;
  nomorRujukan: string;
  namaAcara: string;
  perubahan: { label: string; dari: string; ke: string }[];
}) {
  const token = process.env.FONNTE_WA_API;
  if (!token) {
    console.log("[WA SIMULASI] Token tidak dikonfigurasi.");
    return;
  }

  const jenisLabel = JENIS_LABEL[input.jenis];

  const message = [
    `Hi Tretan COMPACT!👋`,
    `data pengajuan ${jenisLabel} anda diperbarui oleh tim COMPACT.`,
    `nomor rujukan: ${input.nomorRujukan}`,
    `nama acara: ${input.namaAcara}`,
    ``,
    `yang berubah:`,
    ...input.perubahan.map((item) => `- ${item.label}: "${item.dari}" -> "${item.ke}"`),
    ``,
    `bila ini tidak sesuai, hubungi kami ya.`,
    `terimakasih, salam hangat COMPACT.`
  ].join("\n");

  await sendFonnte(token, input.noWa, message);
}

async function sendToGroup(token: string, groupId: string, message: string) {
  await sendFonnte(token, groupId, message);
}
export async function sendWaGroupNotification(input: {
  namaInstansi: string;
  namaAcara: string;
  tempatAcara: string;
  tanggalAcara: Date;
  waktuAcara?: string | null;
  detailPesertaAudiens?: string | null;
  noWa: string;
  email: string;
}) {
  const token = process.env.FONNTE_WA_API;
  const groupId = process.env.FONNTE_GROUP_ID;
  if (!token || !groupId) {
    console.log("[WA SIMULASI] Token atau Group ID tidak dikonfigurasi.");
    return;
  }

  const message = [
    "Hi COMPACT!",
    "ada permohonan pengajuan liputan berikut detailnya:",
    "",
    `nama instansi: ${input.namaInstansi}`,
    `nama acara: ${input.namaAcara}`,
    `tempat acara: ${input.tempatAcara}`,
    `detail peserta/audiens: ${input.detailPesertaAudiens || "-"}`,
    `tanggal acara: ${formatTanggal(input.tanggalAcara)}`,
    `waktu acara: ${input.waktuAcara || "-"}`,
    `No whatsapp: ${input.noWa}`,
    `email: ${input.email}`
  ].join("\n");

  await sendToGroup(token, groupId, message);
}

export async function sendWaGroupNotificationMediaPartner(input: {
  fakultasOrganisasi: string;
  namaAcara: string;
  tanggalRequestUpload: Date;
  kontakPenanggungJawab: string;
}) {
  const token = process.env.FONNTE_WA_API;
  const groupId = process.env.FONNTE_GROUP_ID;
  if (!token || !groupId) {
    console.log("[WA SIMULASI] Token atau Group ID tidak dikonfigurasi.");
    return;
  }

  const message = [
    "Hi COMPACT!",
    "ada permohonan pengajuan media partner berikut detailnya:",
    "",
    `fakultas/organisasi: ${input.fakultasOrganisasi}`,
    `nama acara: ${input.namaAcara}`,
    `tanggal request upload: ${formatTanggal(input.tanggalRequestUpload)}`,
    `kontak penanggung jawab: ${input.kontakPenanggungJawab}`
  ].join("\n");

  await sendToGroup(token, groupId, message);
}

export async function sendWaGroupNotificationKerjasama(input: {
  fakultasOrganisasi: string;
  namaAcara: string;
  tanggalRequestUpload?: Date | null;
  kontakPenanggungJawab: string;
}) {
  const token = process.env.FONNTE_WA_API;
  const groupId = process.env.FONNTE_GROUP_ID;
  if (!token || !groupId) {
    console.log("[WA SIMULASI] Token atau Group ID tidak dikonfigurasi.");
    return;
  }

  const message = [
    "Hi COMPACT!",
    "ada permohonan pengajuan kerjasama berikut detailnya:",
    "",
    `fakultas/organisasi: ${input.fakultasOrganisasi}`,
    `nama acara: ${input.namaAcara}`,
    `tanggal request upload: ${input.tanggalRequestUpload ? formatTanggal(input.tanggalRequestUpload) : "-"}`,
    `kontak penanggung jawab: ${input.kontakPenanggungJawab}`
  ].join("\n");

  await sendToGroup(token, groupId, message);
}

export async function sendWaGroupNotificationPeminjamanPodcast(input: {
  namaInstansi: string;
  namaAcara: string;
  tanggalPeminjaman: Date;
  waktuMulai: string;
  waktuSelesai: string;
  kontakPenanggungJawab: string;
  noteDetail: string;
  email: string;
}) {
  const token = process.env.FONNTE_WA_API;
  const groupId = process.env.FONNTE_GROUP_ID;
  if (!token || !groupId) {
    console.log("[WA SIMULASI] Token atau Group ID tidak dikonfigurasi.");
    return;
  }

  const message = [
    "Hi COMPACT!",
    "ada permohonan peminjaman ruang podcast berikut detailnya:",
    "",
    `nama instansi/organisasi: ${input.namaInstansi}`,
    `nama acara/tujuan: ${input.namaAcara}`,
    `tanggal: ${formatTanggal(input.tanggalPeminjaman)}`,
    `waktu: ${input.waktuMulai} - ${input.waktuSelesai}`,
    `kontak penanggung jawab: ${input.kontakPenanggungJawab}`,
    `note detail: ${input.noteDetail || "-"}`,
    `email: ${input.email}`
  ].join("\n");

  await sendToGroup(token, groupId, message);
}