import type { JenisPermohonan } from "@/lib/status";
import type { JenisPrefix } from "@/lib/reference";

export type FieldType = "text" | "email" | "tel" | "date" | "time" | "textarea" | "file";

/** Nama kolom Prisma yang menyimpan satu field file beserta turunannya. */
export type FileColumns = {
  path: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
};

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
  /** Hanya tampil di formulir publik dan form edit: email, no_wa, dan unggah surat. */
  publicOnly?: boolean;
  /** Render berdua dalam satu grid, mis. waktu mulai dan waktu selesai. */
  half?: boolean;
  /** Field file hanya menerima PDF. */
  pdfOnly?: boolean;
  /**
   * Kolom Prisma yang menyimpan field ini. Wajib untuk field selain file.
   * Dipakai untuk prefill form admin, payload update, dan diff notifikasi,
   * supaya ketiganya tidak masing-masing punya daftar kolom sendiri.
   */
  column?: string;
  /** Wajib untuk field file. */
  fileColumns?: FileColumns;
};

export type FormVariant = "public" | "admin" | "edit";

/** Variant yang punya endpoint POST sendiri. */
export type SubmitVariant = Exclude<FormVariant, "edit">;

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
      {
        name: "nama_instansi",
        label: "Nama instansi/kantor/prodi/unit kampus",
        type: "text",
        column: "namaInstansi"
      },
      {
        name: "email",
        label: "Email kampus",
        type: "email",
        placeholder: EMAIL_PLACEHOLDER,
        publicOnly: true,
        column: "email"
      },
      {
        name: "no_wa",
        label: "No. WhatsApp",
        type: "tel",
        placeholder: "08123456789",
        publicOnly: true,
        column: "noWa"
      },
      { name: "nama_acara", label: "Nama acara", type: "text", column: "namaAcara" },
      {
        name: "tanggal_acara",
        label: "Tanggal acara",
        type: "date",
        minToday: true,
        column: "tanggalAcara"
      },
      { name: "tempat_acara", label: "Tempat acara", type: "text", column: "tempatAcara" },
      {
        name: "detail_peserta_audiens",
        label: "Detail Peserta/Audiens",
        type: "textarea",
        required: false,
        rows: 3,
        column: "detailPesertaAudiens"
      },
      {
        name: "surat_pengajuan",
        label: "Surat pengajuan",
        type: "file",
        publicOnly: true,
        fileColumns: {
          path: "filePath",
          originalName: "fileOriginalName",
          mimeType: "fileMimeType",
          sizeBytes: "fileSizeBytes"
        }
      }
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
        placeholder: "Contoh: UTM TV/BEM Fakultas, dst.",
        column: "fakultasOrganisasi"
      },
      {
        name: "nama_acara",
        label: "Nama Acara",
        type: "text",
        placeholder: ACARA_PLACEHOLDER,
        column: "namaAcara"
      },
      {
        name: "email",
        label: "Email Kampus",
        type: "email",
        placeholder: EMAIL_PLACEHOLDER,
        publicOnly: true,
        column: "email"
      },
      {
        name: "tanggal_request_upload",
        label: "Hari dan Tanggal Request Upload",
        type: "date",
        minToday: true,
        column: "tanggalRequestUpload"
      },
      {
        name: "kontak_penanggung_jawab",
        label: "Kontak Penanggung Jawab",
        type: "text",
        placeholder: KONTAK_PJ_PLACEHOLDER,
        hint: "Usahakan dapat dikontak via WhatsApp.",
        column: "kontakPenanggungJawab"
      },
      {
        name: "surat_media_partner",
        label: "Surat Permohonan Media Partner",
        type: "file",
        publicOnly: true,
        fileColumns: {
          path: "filePath",
          originalName: "fileOriginalName",
          mimeType: "fileMimeType",
          sizeBytes: "fileSizeBytes"
        }
      }
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
        placeholder: "Contoh: UTM TV/BEM Fakultas, dst.",
        column: "fakultasOrganisasi"
      },
      {
        name: "nama_acara",
        label: "Nama Acara",
        type: "text",
        placeholder: ACARA_PLACEHOLDER,
        column: "namaAcara"
      },
      {
        name: "email",
        label: "Email Kampus",
        type: "email",
        placeholder: EMAIL_PLACEHOLDER,
        publicOnly: true,
        column: "email"
      },
      {
        name: "tanggal_request_upload",
        label: "Hari dan Tanggal Request Upload",
        type: "date",
        minToday: true,
        required: false,
        column: "tanggalRequestUpload"
      },
      {
        name: "kontak_penanggung_jawab",
        label: "Kontak Penanggung Jawab",
        type: "text",
        placeholder: KONTAK_PJ_PLACEHOLDER,
        hint: "Usahakan dapat dikontak via WhatsApp.",
        column: "kontakPenanggungJawab"
      },
      {
        name: "surat_kerjasama",
        label: "Surat Permohonan Kerjasama",
        type: "file",
        publicOnly: true,
        fileColumns: {
          path: "filePath",
          originalName: "fileOriginalName",
          mimeType: "fileMimeType",
          sizeBytes: "fileSizeBytes"
        }
      }
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
        placeholder: "Contoh: Fakultas, BEM, dsb.",
        column: "namaInstansi"
      },
      {
        name: "nama_acara",
        label: "Nama Acara/Tujuan Peminjaman",
        type: "text",
        placeholder: "Contoh: Diskusi dengan rektor, podcast ramadhan",
        column: "namaAcara"
      },
      {
        name: "tanggal_peminjaman",
        label: "Tanggal Peminjaman",
        type: "date",
        minToday: true,
        column: "tanggalPeminjaman"
      },
      { name: "waktu_mulai", label: "Waktu Mulai", type: "time", half: true, column: "waktuMulai" },
      { name: "waktu_selesai", label: "Waktu Selesai", type: "time", half: true, column: "waktuSelesai" },
      {
        name: "kontak_penanggung_jawab",
        label: "Kontak Penanggung Jawab",
        type: "text",
        placeholder: "Contoh: +62812345678 (Nama Penanggung Jawab)",
        hint: "Nomor WhatsApp aktif dan nama penanggung jawab.",
        column: "kontakPenanggungJawab"
      },
      {
        name: "note_detail",
        label: "Note Detail",
        type: "textarea",
        rows: 4,
        placeholder: "Apa saja yang akan dilakukan dan siapa saja yang terlibat.",
        column: "noteDetail"
      },
      {
        name: "email",
        label: "Email Kampus",
        type: "email",
        placeholder: EMAIL_PLACEHOLDER,
        publicOnly: true,
        column: "email"
      },
      {
        name: "surat_rekom_bakk",
        label: "Surat Rekomendasi BAKK",
        type: "file",
        pdfOnly: true,
        publicOnly: true,
        fileColumns: {
          path: "fileRekomBakkPath",
          originalName: "fileRekomBakkOriginalName",
          mimeType: "fileRekomBakkMimeType",
          sizeBytes: "fileRekomBakkSizeBytes"
        }
      },
      {
        name: "surat_pernyataan",
        label: "Surat Pernyataan",
        type: "file",
        pdfOnly: true,
        publicOnly: true,
        fileColumns: {
          path: "filePernyataanPath",
          originalName: "filePernyataanOriginalName",
          mimeType: "filePernyataanMimeType",
          sizeBytes: "filePernyataanSizeBytes"
        }
      }
    ]
  }
};

export const ACCEPT_PDF = ".pdf,application/pdf";
export const ACCEPT_DOC_IMAGE =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

/** Field file milik sebuah jenis. Dipakai formulir publik dan saat admin mengganti lampiran. */
export function getFileFields(jenis: JenisPermohonan) {
  return PERMOHONAN_FORM[jenis].fields.filter((field) => field.type === "file");
}

/** Field yang tampil untuk variant public atau admin. */
export function getVisibleFields(jenis: JenisPermohonan, variant: SubmitVariant) {
  const fields = PERMOHONAN_FORM[jenis].fields;
  if (variant === "public") return fields;
  return fields.filter((field) => !field.publicOnly);
}

/**
 * Field yang boleh diubah admin pada variant edit.
 *
 * Bedanya dengan variant admin: field kontak ikut tampil kalau withKontak
 * benar, karena notifikasi perubahan memang butuh email dan nomor WhatsApp.
 * Field file tidak termasuk di sini karena penggantian lampiran adalah
 * operasi berkas tersendiri, bukan pengisian field biasa.
 */
export function getEditableFields(jenis: JenisPermohonan, withKontak: boolean) {
  return PERMOHONAN_FORM[jenis].fields.filter(
    (field) => field.type !== "file" && (withKontak || !field.publicOnly)
  );
}

/** Endpoint POST untuk variant public dan admin. */
export function getSubmitEndpoint(jenis: JenisPermohonan, variant: SubmitVariant) {
  if (variant === "admin") return "/api/admin/permohonan";
  return PERMOHONAN_FORM[jenis].endpoint;
}

/** Endpoint PUT untuk variant edit. Jenis dibawa lewat query param, sama seperti PATCH. */
export function getEditEndpoint(jenis: JenisPermohonan, id: number) {
  return `/api/admin/permohonan/${id}?jenis=${jenis}`;
}

/**
 * Ubah nilai kolom bertipe @db.Date menjadi YYYY-MM-DD untuk mengisi input
 * type="date". Harus lewat toISOString() dan bukan pemformat lokal: kolom
 * tanggal dibaca Prisma sebagai tengah malam UTC, sedangkan formatTanggal()
 * memakai zona waktu server dan bisa mundur sehari di WIB.
 */
export function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
