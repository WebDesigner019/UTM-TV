import { formatTanggal } from "@/lib/status";

const FONNTE_API = "https://api.fonnte.com/send";

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
    `pengajuan liputan anda telah kami terima pada:`,
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

  const response = await fetch(FONNTE_API, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target: input.noWa,
      message,
      type: "text"
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[WA KE USER GAGAL]", response.status, body);
  }
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

  const response = await fetch(FONNTE_API, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target: groupId,
      message,
      type: "text"
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[WA GAGAL]", response.status, body);
  }
}
