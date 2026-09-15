import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import type { StatusPermohonan } from "@prisma/client";
import { getAppUrl } from "@/lib/env";
import { JENIS_LABEL, type JenisPermohonan, STATUS_LABEL, formatTanggal } from "@/lib/status";
import path from "path";
import fs from "fs";

const THEME = {
  brand: "#0f766e",
  ink: "#18212f",
  line: "#dce3ec",
  accent: "#c2410c",
  bg: "#f7f9fb",
  logoNavy: "#002740",
  logoBlue: "#0F87D3",
  logoOrange: "#F67D14"
} as const;

const STATUS_COLOR: Record<StatusPermohonan, string> = {
  diterima: "#3b82f6",
  disetujui: "#22c55e",
  ditolak: "#ef4444",
  selesai: "#0f766e"
};

const STATUS_BG: Record<StatusPermohonan, string> = {
  diterima: "#eff6ff",
  disetujui: "#f0fdf4",
  ditolak: "#fef2f2",
  selesai: "#f0fdfa"
};

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

function buildEmailHtml(content: string, logoCid?: string) {
  const logoHtml = logoCid
    ? `<img src="cid:${logoCid}" alt="UTM-TV" style="max-width:130px;height:auto;display:block;margin:0 auto;" />`
    : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body {
      margin: 0; padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      background: ${THEME.bg};
      color: ${THEME.ink};
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }
    .outer {
      padding: 32px 16px;
    }
    .card {
      max-width: 560px; margin: 0 auto;
      background: #ffffff;
      border: 1px solid ${THEME.line};
      border-radius: 12px;
      overflow: hidden;
    }
    .card-header {
      background: ${THEME.logoNavy};
      text-align: center;
      padding: 28px 24px 20px;
    }
    .card-body {
      padding: 28px 32px;
    }
    .card-footer {
      padding: 20px 32px;
      border-top: 1px solid ${THEME.line};
      font-size: 13px;
      color: #64748b;
      text-align: center;
      background: #fafbfc;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: ${THEME.ink};
      margin: 0 0 8px;
    }
    p {
      margin: 0 0 16px;
      color: #334155;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .info-table td {
      padding: 8px 0;
      vertical-align: top;
      font-size: 14px;
    }
    .info-table td:first-child {
      width: 135px;
      font-weight: 600;
      color: ${THEME.ink};
    }
    .info-table td:last-child {
      color: #334155;
    }
    .badge {
      display: inline-block;
      padding: 3px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    .message-box {
      background: #f8fafc;
      border-left: 4px solid ${THEME.brand};
      padding: 14px 16px;
      border-radius: 6px;
      margin: 16px 0;
      font-size: 14px;
      color: #334155;
    }
    .message-box p { margin: 0; }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: ${THEME.brand};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .btn:hover { background: #0d5e57; }
    .btn-orange {
      background: ${THEME.logoOrange};
    }
    .btn-orange:hover { background: #d96a0e; }
    .divider {
      height: 1px;
      background: ${THEME.line};
      margin: 20px 0;
    }
    .accent-line {
      height: 4px;
      background: linear-gradient(90deg, ${THEME.brand}, ${THEME.logoBlue}, ${THEME.logoOrange});
    }
    .text-center { text-align: center; }
    .mt-16 { margin-top: 16px; }
    a { color: ${THEME.brand}; }
    @media only screen and (max-width: 480px) {
      .outer { padding: 16px 8px; }
      .card-body { padding: 20px 16px; }
      .card-footer { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="outer">
    <div class="card">
      <div class="accent-line"></div>
      <div class="card-header">
        ${logoHtml}
      </div>
      <div class="card-body">
        ${content}
      </div>
      <div class="card-footer">
        &copy; ${new Date().getFullYear()} UTM-TV &mdash; Lembaga Penyiaran Kampus Universitas Trunojoyo Madura
      </div>
    </div>
  </div>
</body>
</html>`;
}

function getLogoAttachment(): Mail.Attachment[] {
  const logoPath = path.join(process.cwd(), "public", "assets", "utm-tv-logo.jpg");
  if (fs.existsSync(logoPath)) {
    return [{ filename: "utm-tv-logo.jpg", path: logoPath, cid: "logo" }];
  }
  return [];
}

export async function sendPermohonanDiterimaEmail(input: {
  email: string;
  nomorRujukan: string;
  namaAcara: string;
  jenis?: JenisPermohonan;
}) {
  const jenis = input.jenis || "liputan";
  const jenisLabel = JENIS_LABEL[jenis];
  const lacakUrl = `${getAppUrl()}/lacak`;
  const text = [
    `Permohonan ${jenisLabel} Anda telah diterima.`,
    "",
    `Nomor rujukan: ${input.nomorRujukan}`,
    `Nama acara: ${input.namaAcara}`,
    `Cek status permohonan: ${lacakUrl}`,
    "",
    "Simpan nomor rujukan ini untuk pelacakan."
  ].join("\n");

  const html = buildEmailHtml(`
    <div class="text-center">
      <h1>Permohonan Diterima</h1>
      <p style="color:#64748b;font-size:15px;">Permohonan ${jenisLabel} Anda telah kami terima dan sedang diproses.</p>
    </div>
    <table class="info-table">
      <tr>
        <td>Nomor Rujukan</td>
        <td><strong style="color:${THEME.brand};">${input.nomorRujukan}</strong></td>
      </tr>
      <tr>
        <td>Nama Acara</td>
        <td>${input.namaAcara}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td><span class="badge" style="background:${STATUS_BG.diterima};color:${STATUS_COLOR.diterima};">${STATUS_LABEL.diterima}</span></td>
      </tr>
    </table>
    <div class="divider"></div>
    <p style="font-size:14px;">Simpan nomor rujukan di atas untuk memantau status permohonan Anda.</p>
    <div class="text-center mt-16">
      <a href="${lacakUrl}" class="btn btn-orange">Lacak Permohonan</a>
    </div>
  `, "logo");

  await sendMail(input.email, `Permohonan ${jenisLabel} diterima - ${input.nomorRujukan}`, text, html, getLogoAttachment());
}

export async function sendStatusChangedEmail(input: {
  email: string;
  nomorRujukan: string;
  status: StatusPermohonan;
  pesan?: string | null;
  jenis?: JenisPermohonan;
}) {
  const jenis = input.jenis || "liputan";
  const jenisLabel = JENIS_LABEL[jenis];
  const label = STATUS_LABEL[input.status];
  const color = STATUS_COLOR[input.status];
  const bg = STATUS_BG[input.status];

  const text = [
    `Status permohonan ${jenisLabel} ${input.nomorRujukan} diperbarui.`,
    "",
    `Status baru: ${label}`,
    input.pesan ? `Pesan: ${input.pesan}` : null,
    "",
    `Cek status permohonan: ${getAppUrl()}/lacak`
  ]
    .filter(Boolean)
    .join("\n");

  const html = buildEmailHtml(`
    <div class="text-center">
      <h1>Status Diperbarui</h1>
      <p style="color:#64748b;font-size:15px;">Status permohonan ${jenisLabel} Anda telah diperbarui.</p>
    </div>
    <table class="info-table">
      <tr>
        <td>Nomor Rujukan</td>
        <td><strong style="color:${THEME.brand};">${input.nomorRujukan}</strong></td>
      </tr>
      <tr>
        <td>Status Baru</td>
        <td><span class="badge" style="background:${bg};color:${color};">${label}</span></td>
      </tr>
    </table>
    ${input.pesan ? `
    <div class="message-box">
      <p><strong>Pesan:</strong> ${input.pesan}</p>
    </div>` : ""}
    <div class="divider"></div>
    <div class="text-center mt-16">
      <a href="${getAppUrl()}/lacak" class="btn">Lacak Permohonan</a>
    </div>
  `, "logo");

  await sendMail(input.email, `Status permohonan ${jenisLabel} diperbarui - ${input.nomorRujukan}`, text, html, getLogoAttachment());
}

export async function sendPermohonanDisetujuiEmail(input: {
  email: string;
  jenis?: JenisPermohonan;
  namaAcara: string;
  tempatAcara?: string;
  tanggalAcara?: Date;
  tanggalRequestUpload?: Date | null;
  pesan?: string | null;
}) {
  const jenis = input.jenis || "liputan";
  const jenisLabel = JENIS_LABEL[jenis];
  const keterangan = input.pesan || "-";

  const isLiputan = jenis === "liputan";
  const tanggal = isLiputan ? formatTanggal(input.tanggalAcara || new Date()) : (input.tanggalRequestUpload ? formatTanggal(input.tanggalRequestUpload) : "-");

  const detailRows = isLiputan
    ? `
      <tr>
        <td>Tempat</td>
        <td>${input.tempatAcara || "-"}</td>
      </tr>
      <tr>
        <td>Tanggal</td>
        <td>${tanggal}</td>
      </tr>`
    : `
      <tr>
        <td>Tanggal Request Upload</td>
        <td>${tanggal}</td>
      </tr>`;

  const text = [
    `Pengajuan ${jenisLabel} Anda telah disetujui!`,
    "",
    `Nama acara: ${input.namaAcara}`,
    ...(isLiputan
      ? [`Tempat: ${input.tempatAcara || "-"}`, `Tanggal: ${tanggal}`]
      : [`Tanggal request upload: ${tanggal}`]),
    "Status: disetujui",
    "",
    `Dengan keterangan: ${keterangan}`,
    "",
    "Terima kasih, salam hangat UTM-TV."
  ].join("\n");

  const html = buildEmailHtml(`
    <div class="text-center">
      <h1>Pengajuan Disetujui</h1>
      <p style="color:#64748b;font-size:15px;">Selamat! Pengajuan ${jenisLabel} Anda telah disetujui oleh tim UTM-TV.</p>
    </div>
    <table class="info-table">
      <tr>
        <td>Nama Acara</td>
        <td><strong>${input.namaAcara}</strong></td>
      </tr>
      ${detailRows}
      <tr>
        <td>Status</td>
        <td><span class="badge" style="background:${STATUS_BG.disetujui};color:${STATUS_COLOR.disetujui};">disetujui</span></td>
      </tr>
    </table>
    <div class="message-box">
      <p><strong>Keterangan:</strong></p>
      <p>${keterangan}</p>
    </div>
    <p style="font-size:14px;color:#64748b;">Silakan hubungi kami jika ada perubahan jadwal atau informasi lebih lanjut.</p>
    <div class="text-center mt-16">
      <a href="${getAppUrl()}/lacak" class="btn btn-orange">Cek Status</a>
    </div>
  `, "logo");

  await sendMail(input.email, `Pengajuan ${jenisLabel} disetujui`, text, html, getLogoAttachment());
}

export async function sendAdminPasswordResetEmail(input: {
  email: string;
  nama: string;
  resetUrl: string;
}) {
  const text = [
    `Halo ${input.nama},`,
    "",
    "Kami menerima permintaan untuk membuat password admin baru.",
    `Buka tautan berikut untuk melanjutkan: ${input.resetUrl}`,
    "",
    "Tautan ini berlaku selama 30 menit. Abaikan email ini jika Anda tidak meminta reset password."
  ].join("\n");

  const html = buildEmailHtml(`
    <div class="text-center">
      <h1>Reset Password Admin</h1>
      <p style="color:#64748b;font-size:15px;">Kami menerima permintaan reset password untuk akun admin Anda.</p>
    </div>
    <p>Halo, <strong>${input.nama}</strong>!</p>
    <p>Klik tombol di bawah untuk membuat password baru. Tautan ini berlaku selama <strong>30 menit</strong>.</p>
    <div class="text-center mt-16">
      <a href="${input.resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size:13px;color:#94a3b8;margin-top:24px;">Abaikan email ini jika Anda tidak merasa meminta reset password. Jika tombol tidak berfungsi, salin tautan berikut ke browser:</p>
    <p style="font-size:12px;color:#64748b;word-break:break-all;">${input.resetUrl}</p>
  `, "logo");

  await sendMail(input.email, "Reset password admin UTM TV", text, html, getLogoAttachment());
}
