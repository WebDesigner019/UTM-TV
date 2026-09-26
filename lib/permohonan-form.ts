import type { JenisPermohonan } from "@/lib/status";
import type { JenisPrefix } from "@/lib/reference";

export type FieldType = "text" | "email" | "tel" | "date" | "time" | "textarea" | "file";

/**
 * Batas ukuran unggahan cadangan untuk tampilan di klien. Halaman publik
 * seharusnya selalu mengoper maxSizeMb yang dihitung di server; nilai ini
 * hanya mencegah "Maksimal 0 MB" kalau ada yang lupa mengoper. Nilai
 * yang benar-benar ditegakkan tetap getMaxFileSizeBytes() di sisi server,
 * jadi default-nya sengaja sama dengan default lib/env.ts.
 */
export const MAX_FILE_SIZE_MB_FALLBACK = 5;

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  rows?: number;
  /** Kolom date dibatasi minimal tanggal hari ini. Diabaikan pada variant admin. */
  minToday?: boolean;
  /** Hanya tampil di formulir publik: email, no_wa, dan unggah surat. */
  publicOnly?: boolean;
  /** Render berdua dalam satu grid, mis. waktu mulai dan waktu selesai. */
  half?: boolean;
  /** Field file hanya menerima PDF. */
  pdfOnly?: boolean;
};

export type FormVariant = "public" | "admin";

export type PermohonanFormConfig = {
  prefix: JenisPrefix;
  /** Endpoint API formulir publik. */
  endpoint: string;
  fields: FieldDef[];
};

const KONTAK_PJ_PLACEHOLDER =
  "Contoh: +62812345678 (Akbar/Himpunan Mahasiswa Sistem Informasi (+628573022837))";
const ACARA_PLACEHOLDER = "Contoh: Donor Darah Bersama 2026";
const EMAIL_PLACEHOLDER = "nama@student.trunojoyo.ac.id";

export const PERMOHONAN_FORM: Record<JenisPermohonan, PermohonanFormConfig> = {
  liputan: {
    prefix: "LIP",
    endpoint: "/api/permohonan/liputan",
    fields: [
      { name: "nama_instansi", label: "Nama instansi/kantor/prodi/unit kampus", type: "text" },
      { name: "email", label: "Email kampus", type: "email", placeholder: EMAIL_PLACEHOLDER, publicOnly: true },
      { name: "no_wa", label: "No. WhatsApp", type: "tel", placeholder: "08123456789", publicOnly: true },
      { name: "nama_acara", label: "Nama acara", type: "text" },
      { name: "tanggal_acara", label: "Tanggal acara", type: "date", minToday: true },
      { name: "tempat_acara", label: "Tempat acara", type: "text" },
      {
        name: "detail_peserta_audiens",
        label: "Detail Peserta/Audiens",
        type: "textarea",
        required: false,
        rows: 3
      },
      { name: "surat_pengajuan", label: "Surat pengajuan", type: "file", publicOnly: true }
    ]
  },

  media_partner: {
    prefix: "MP",
    endpoint: "/api/permohonan/media-partner",
    fields: [
      {
        name: "fakultas_organisasi",
        label: "Fakultas/Organisasi/Unit Penyelenggara Acara",
        type: "text",
        placeholder: "Contoh: UTM TV/BEM Fakultas, dst."
      },
      { name: "nama_acara", label: "Nama Acara", type: "text", placeholder: ACARA_PLACEHOLDER },
      { name: "email", label: "Email Kampus", type: "email", placeholder: EMAIL_PLACEHOLDER, publicOnly: true },
      { name: "tanggal_request_upload", label: "Hari dan Tanggal Request Upload", type: "date", minToday: true },
      {
        name: "kontak_penanggung_jawab",
        label: "Kontak Penanggung Jawab",
        type: "text",
        placeholder: KONTAK_PJ_PLACEHOLDER,
        hint: "Usahakan dapat dikontak via WhatsApp."
      },
      { name: "surat_media_partner", label: "Surat Permohonan Media Partner", type: "file", publicOnly: true }
    ]
  },

  kerjasama: {
    prefix: "KJ",
    endpoint: "/api/permohonan/kerjasama",
    fields: [
      {
        name: "fakultas_organisasi",
        label: "Fakultas/Organisasi/Unit Penyelenggara Acara",
        type: "text",
        placeholder: "Contoh: UTM TV/BEM Fakultas, dst."
      },
      { name: "nama_acara", label: "Nama Acara", type: "text", placeholder: ACARA_PLACEHOLDER },
      { name: "email", label: "Email Kampus", type: "email", placeholder: EMAIL_PLACEHOLDER, publicOnly: true },
      {
        name: "tanggal_request_upload",
        label: "Hari dan Tanggal Request Upload",
        type: "date",
        minToday: true,
        required: false
      },
      {
        name: "kontak_penanggung_jawab",
        label: "Kontak Penanggung Jawab",
        type: "text",
        placeholder: KONTAK_PJ_PLACEHOLDER,
        hint: "Usahakan dapat dikontak via WhatsApp."
      },
      { name: "surat_kerjasama", label: "Surat Permohonan Kerjasama", type: "file", publicOnly: true }
    ]
  },

  peminjaman_podcast: {
    prefix: "PP",
    endpoint: "/api/permohonan/peminjaman-podcast",
    fields: [
      {
        name: "nama_instansi",
        label: "Nama Organisasi/Instansi",
        type: "text",
        placeholder: "Contoh: Fakultas, BEM, dsb."
      },
      {
        name: "nama_acara",
        label: "Nama Acara/Tujuan Peminjaman",
        type: "text",
        placeholder: "Contoh: Diskusi dengan rektor, podcast ramadhan"
      },
      { name: "tanggal_peminjaman", label: "Tanggal Peminjaman", type: "date", minToday: true },
      { name: "waktu_mulai", label: "Waktu Mulai", type: "time", half: true },
      { name: "waktu_selesai", label: "Waktu Selesai", type: "time", half: true },
      {
        name: "kontak_penanggung_jawab",
        label: "Kontak Penanggung Jawab",
        type: "text",
        placeholder: "Contoh: +62812345678 (Nama Penanggung Jawab)",
        hint: "Nomor WhatsApp aktif dan nama penanggung jawab."
      },
      {
        name: "note_detail",
        label: "Note Detail",
        type: "textarea",
        rows: 4,
        placeholder: "Apa saja yang akan dilakukan dan siapa saja yang terlibat."
      },
      { name: "email", label: "Email Kampus", type: "email", placeholder: EMAIL_PLACEHOLDER, publicOnly: true },
      { name: "surat_rekom_bakk", label: "Surat Rekomendasi BAKK", type: "file", pdfOnly: true, publicOnly: true },
      { name: "surat_pernyataan", label: "Surat Pernyataan", type: "file", pdfOnly: true, publicOnly: true }
    ]
  }
};

export const ACCEPT_PDF = ".pdf,application/pdf";
export const ACCEPT_DOC_IMAGE =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

/** Field file milik sebuah jenis. Hanya dipakai pada alur formulir publik. */
export function getFileFields(jenis: JenisPermohonan) {
  return PERMOHONAN_FORM[jenis].fields.filter((field) => field.type === "file");
}

/** Field yang tampil untuk variant tertentu. */
export function getVisibleFields(jenis: JenisPermohonan, variant: FormVariant) {
  const fields = PERMOHONAN_FORM[jenis].fields;
  if (variant === "public") return fields;
  return fields.filter((field) => !field.publicOnly);
}

/** Endpoint POST untuk variant tertentu. */
export function getSubmitEndpoint(jenis: JenisPermohonan, variant: FormVariant) {
  if (variant === "admin") return "/api/admin/permohonan";
  return PERMOHONAN_FORM[jenis].endpoint;
}
