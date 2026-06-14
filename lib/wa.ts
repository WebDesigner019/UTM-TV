import { formatTanggal } from "@/lib/status";

const FONNTE_API = "https://api.fonnte.com/send";

export async function sendWaGroupNotification(input: {
  namaInstansi: string;
  namaAcara: string;
  tempatAcara: string;
  tanggalAcara: Date;
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
