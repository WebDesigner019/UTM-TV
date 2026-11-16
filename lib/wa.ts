import type { StatusPermohonan } from "@prisma/client";
import { JENIS_LABEL, type JenisPermohonan, STATUS_LABEL, formatTanggal } from "@/lib/status";

const FONNTE_API = "https://api.fonnte.com/send";

function pesanDisetujui(jenisLabel: string, detail: string[], pesan?: string | null) {
  return [
    "*Hi, Tretan UTM* 👋",
    "",
    `Kabar baik! Pengajuan layanan ${jenisLabel} Anda telah DISETUJUI oleh tim UTM TV.`,
    "",
    "Berikut detail kegiatan yang telah dikonfirmasi:",
    ...detail,
    "✅ *Status*: Disetujui",
    "",
    "*Catatan dari Tim COMPACT*:",
    pesan?.trim() || "-",
    "",
    "Terima kasih telah menggunakan layanan COMPACT UTM TV.",
    "",
    "Salam hangat,",
    "*Tim Administrasi dan Kerjasama – UTM TV*"
  ].join("\n");
}

function pesanGrup(jenisLabel: string, detail: string[]) {
  return [
    "*Hi, Tim Administrasi dan Kerjasama* 👋",
    `Ada permohonan layanan ${jenisLabel} baru yang masuk dengan detail berikut:`,
    ...detail,
    "",
    "Mohon segera dilakukan pengecekan dan tindak lanjut pengajuan."
  ].join("\n");
}

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

  const message = pesanDisetujui(
    JENIS_LABEL.liputan,
    [
      `📌 *Nama Acara*: ${input.namaAcara}`,
      `📍 *Tempat*: ${input.tempatAcara}`,
      `📅 *Tanggal*: ${tanggal}`,
      // Baris waktu hanya muncul kalau pemohon mengisinya, supaya pesan tidak
      // memunculkan "waktu: -" untuk pengajuan yang jadwalnya memang belum pasti.
      ...(input.waktuAcara ? [`⏰ *Waktu*: ${input.waktuAcara}`] : [])
    ],
    input.pesan
  );

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

  const message = pesanDisetujui(
    JENIS_LABEL.media_partner,
    [
      `📌 *Nama Acara*: ${input.namaAcara}`,
      `📅 *Tanggal Request Upload*: ${tanggal}`
    ],
    input.pesan
  );

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

  const message = pesanDisetujui(
    JENIS_LABEL.kerjasama,
    [
      `📌 *Nama Acara*: ${input.namaAcara}`,
      `📅 *Tanggal Request Upload*: ${tanggal}`
    ],
    input.pesan
  );

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

  const message = pesanDisetujui(
    JENIS_LABEL.peminjaman_podcast,
    [
      `📌 *Nama Acara*: ${input.namaAcara}`,
      `📅 *Tanggal*: ${formatTanggal(input.tanggalPeminjaman)}`,
      `⏰ *Waktu*: ${input.waktuMulai} - ${input.waktuSelesai}`
    ],
    input.pesan
  );

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

  const message = pesanGrup(JENIS_LABEL.liputan, [
    `📌 *Instansi*: ${input.namaInstansi}`,
    `🎥 *Acara*: ${input.namaAcara}`,
    `📍 *Tempat*: ${input.tempatAcara}`,
    `📅 *Tanggal*: ${formatTanggal(input.tanggalAcara)}`,
    `⏰ *Waktu*: ${input.waktuAcara || "-"}`,
    `👥 *Detail*: ${input.detailPesertaAudiens || "-"}`,
    `📞 *WhatsApp*: ${input.noWa}`,
    `✉️ *Email*: ${input.email}`
  ]);

  await sendToGroup(token, groupId, message);
}

export async function sendWaGroupNotificationMediaPartner(input: {
  fakultasOrganisasi: string;
  namaAcara: string;
  tanggalRequestUpload: Date;
  kontakPenanggungJawab: string;
  email: string;
}) {
  const token = process.env.FONNTE_WA_API;
  const groupId = process.env.FONNTE_GROUP_ID;
  if (!token || !groupId) {
    console.log("[WA SIMULASI] Token atau Group ID tidak dikonfigurasi.");
    return;
  }

  const message = pesanGrup(JENIS_LABEL.media_partner, [
    `📌 *Instansi*: ${input.fakultasOrganisasi}`,
    `🎥 *Acara*: ${input.namaAcara}`,
    `📍 *Tempat*: -`,
    `📅 *Tanggal*: ${formatTanggal(input.tanggalRequestUpload)}`,
    `⏰ *Waktu*: -`,
    `👥 *Detail*: -`,
    `📞 *WhatsApp*: ${input.kontakPenanggungJawab}`,
    `✉️ *Email*: ${input.email}`
  ]);

  await sendToGroup(token, groupId, message);
}

export async function sendWaGroupNotificationKerjasama(input: {
  fakultasOrganisasi: string;
  namaAcara: string;
  tanggalRequestUpload?: Date | null;
  kontakPenanggungJawab: string;
  email: string;
}) {
  const token = process.env.FONNTE_WA_API;
  const groupId = process.env.FONNTE_GROUP_ID;
  if (!token || !groupId) {
    console.log("[WA SIMULASI] Token atau Group ID tidak dikonfigurasi.");
    return;
  }

  const message = pesanGrup(JENIS_LABEL.kerjasama, [
    `📌 *Instansi*: ${input.fakultasOrganisasi}`,
    `🎥 *Acara*: ${input.namaAcara}`,
    `📍 *Tempat*: -`,
    `📅 *Tanggal*: ${input.tanggalRequestUpload ? formatTanggal(input.tanggalRequestUpload) : "-"}`,
    `⏰ *Waktu*: -`,
    `👥 *Detail*: -`,
    `📞 *WhatsApp*: ${input.kontakPenanggungJawab}`,
    `✉️ *Email*: ${input.email}`
  ]);

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

  const message = pesanGrup(JENIS_LABEL.peminjaman_podcast, [
    `📌 *Instansi*: ${input.namaInstansi}`,
    `🎥 *Acara*: ${input.namaAcara}`,
    `📍 *Tempat*: Ruang Podcast`,
    `📅 *Tanggal*: ${formatTanggal(input.tanggalPeminjaman)}`,
    `⏰ *Waktu*: ${input.waktuMulai} - ${input.waktuSelesai}`,
    `👥 *Detail*: ${input.noteDetail || "-"}`,
    `📞 *WhatsApp*: ${input.kontakPenanggungJawab}`,
    `✉️ *Email*: ${input.email}`
  ]);

  await sendToGroup(token, groupId, message);
}