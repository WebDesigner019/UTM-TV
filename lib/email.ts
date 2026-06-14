import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import type { StatusPermohonan } from "@prisma/client";
import { getAppUrl } from "@/lib/env";
import { STATUS_LABEL, formatTanggal } from "@/lib/status";
import path from "path";
import fs from "fs";

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
}

async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: Mail.Attachment[]
) {
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

  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    text
  };

  if (html) mailOptions.html = html;
  if (attachments && attachments.length > 0) mailOptions.attachments = attachments;

  await transporter.sendMail(mailOptions);
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

export async function sendPermohonanDisetujuiEmail(input: {
  email: string;
  namaAcara: string;
  tempatAcara: string;
  tanggalAcara: Date;
  pesan?: string | null;
}) {
  const logoPath = path.join(process.cwd(), "public", "assets", "utm-tv-logo.jpg");
  const logoExists = fs.existsSync(logoPath);

  const tanggal = formatTanggal(input.tanggalAcara);
  const keterangan = input.pesan || "-";

  const text = [
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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px; }
    .header { text-align: center; padding: 20px 0; }
    .logo { max-width: 120px; height: auto; }
    .content { padding: 20px 0; line-height: 1.6; }
    .label { font-weight: bold; }
    .keterangan { background: #f5f5f5; padding: 12px; border-radius: 6px; margin-top: 8px; }
    .status-badge {
      display: inline-block; background: #22c55e; color: #fff;
      padding: 4px 14px; border-radius: 999px; font-size: 14px; font-weight: 600;
    }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoExists ? '<img src="cid:logo" alt="UTM-TV" class="logo" />' : ""}
    </div>
    <div class="content">
      <p>Hi Tretan UTM!👋</p>
      <p>pengajuan liputan anda telah kami terima pada:</p>
      <table>
        <tr><td class="label">nama acara</td><td>: ${input.namaAcara}</td></tr>
        <tr><td class="label">tempat</td><td>: ${input.tempatAcara}</td></tr>
        <tr><td class="label">tanggal</td><td>: ${tanggal}</td></tr>
        <tr><td class="label">status</td><td>: <span class="status-badge">disetujui</span></td></tr>
      </table>
      <p>dengan keterangan:</p>
      <div class="keterangan">${keterangan}</div>
      <p>terimakasih, salam hangat UTM-TV.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UTM-TV
    </div>
  </div>
</body>
</html>`;

  const attachments: Mail.Attachment[] = [];
  if (logoExists) {
    attachments.push({
      filename: "utm-tv-logo.jpg",
      path: logoPath,
      cid: "logo"
    });
  }

  await sendMail(
    input.email,
    "Pengajuan liputan disetujui",
    text,
    html,
    attachments.length > 0 ? attachments : undefined
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
