import nodemailer from "nodemailer";
import type { StatusPermohonan } from "@prisma/client";
import { getAppUrl } from "@/lib/env";
import { STATUS_LABEL } from "@/lib/status";

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
}

async function sendMail(to: string, subject: string, text: string) {
  if (!smtpReady()) {
    console.log("[EMAIL SIMULASI]", { to, subject, text });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text
  });
}

export async function sendPermohonanDiterimaEmail(input: {
  email: string;
  nomorRujukan: string;
  namaAcara: string;
}) {
  const lacakUrl = `${getAppUrl()}/lacak`;
  await sendMail(
    input.email,
    `Permohonan liputan diterima - ${input.nomorRujukan}`,
    [
      "Permohonan liputan Anda telah diterima.",
      "",
      `Nomor rujukan: ${input.nomorRujukan}`,
      `Nama acara: ${input.namaAcara}`,
      `Cek status permohonan: ${lacakUrl}`,
      "",
      "Simpan nomor rujukan ini untuk pelacakan."
    ].join("\n")
  );
}

export async function sendStatusChangedEmail(input: {
  email: string;
  nomorRujukan: string;
  status: StatusPermohonan;
  pesan?: string | null;
}) {
  await sendMail(
    input.email,
    `Status permohonan diperbarui - ${input.nomorRujukan}`,
    [
      `Status permohonan ${input.nomorRujukan} diperbarui.`,
      "",
      `Status baru: ${STATUS_LABEL[input.status]}`,
      input.pesan ? `Pesan: ${input.pesan}` : null,
      "",
      `Cek status permohonan: ${getAppUrl()}/lacak`
    ]
      .filter(Boolean)
      .join("\n")
  );
}

export async function sendAdminPasswordResetEmail(input: {
  email: string;
  nama: string;
  resetUrl: string;
}) {
  await sendMail(
    input.email,
    "Reset password admin UTM TV",
    [
      `Halo ${input.nama},`,
      "",
      "Kami menerima permintaan untuk membuat password admin baru.",
      `Buka tautan berikut untuk melanjutkan: ${input.resetUrl}`,
      "",
      "Tautan ini berlaku selama 30 menit. Abaikan email ini jika Anda tidak meminta reset password."
    ].join("\n")
  );
}
