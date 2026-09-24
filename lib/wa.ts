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
    `Hi Tretan UTM!👋`,
    `pengajuan liputan anda telah disetujui:`,
    `nama acara: ${input.namaAcara}`,
    `tempat: ${input.tempatAcara}`,
    `tanggal: ${tanggal}`,
    `status: disetujui`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat UTM-TV.`
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
    `Hi Tretan UTM!👋`,
    `pengajuan media partner anda telah disetujui:`,
    `nama acara: ${input.namaAcara}`,
    `tanggal request upload: ${tanggal}`,
    `status: disetujui`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat UTM-TV.`
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
    `Hi Tretan UTM!👋`,
    `pengajuan kerjasama anda telah disetujui:`,
    `nama acara: ${input.namaAcara}`,
    `tanggal request upload: ${tanggal}`,
    `status: disetujui`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat UTM-TV.`
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
    `Hi Tretan UTM!👋`,
    `status pengajuan ${jenisLabel} anda telah diperbarui.`,
    `nama acara: ${input.namaAcara}`,
    `status: ${statusLabel}`,
    ``,
    `dengan keterangan:`,
    `${keterangan}`,
    ``,
    `terimakasih, salam hangat UTM-TV.`
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
    "Hi UTM-TV!",
    "ada permohonan pengajuan liputan berikut detailnya:",
    "",
    `nama instansi: ${input.namaInstansi}`,
    `nama acara: ${input.namaAcara}`,
    `tempat acara: ${input.tempatAcara}`,
    `detail peserta/audiens: ${input.detailPesertaAudiens || "-"}`,
    `tanggal acara: ${formatTanggal(input.tanggalAcara)}`,
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
    "Hi UTM-TV!",
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
    "Hi UTM-TV!",
    "ada permohonan pengajuan kerjasama berikut detailnya:",
    "",
    `fakultas/organisasi: ${input.fakultasOrganisasi}`,
    `nama acara: ${input.namaAcara}`,
    `tanggal request upload: ${input.tanggalRequestUpload ? formatTanggal(input.tanggalRequestUpload) : "-"}`,
    `kontak penanggung jawab: ${input.kontakPenanggungJawab}`
  ].join("\n");

  await sendToGroup(token, groupId, message);
}