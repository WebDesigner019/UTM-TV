import { z } from "zod";
import { JENIS_OPTIONS, type JenisPermohonan } from "@/lib/status";
import { getFileFields, PERMOHONAN_FORM, type FieldDef } from "@/lib/permohonan-form";

const wajib = (message: string, min = 1) => z.string().min(min, message);

/**
 * Waktu "HH:mm" dari input type="time".
 *
 * Sengaja opsional: pemohon boleh belum tahu jadwalnya, dan kolomnya nullable
 * supaya data yang sudah ada tidak ikut berubah artinya. Polanya tetap dikunci
 * supaya payload yang dirakit di luar formulir tidak bisa menyimpan "malam".
 */
const waktuHHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format waktu tidak valid. Contoh: 09:30.");

export const skemaPermohonan = {
  liputan: z.object({
    nama_instansi: wajib("Nama instansi wajib diisi.", 2),
    email: z.string().email("Email tidak valid."),
    no_wa: wajib("No. WhatsApp wajib diisi."),
    nama_acara: wajib("Nama acara wajib diisi.", 2),
    tanggal_acara: wajib("Tanggal acara wajib diisi."),
    waktu_acara: waktuHHMM.optional(),
    tempat_acara: wajib("Tempat acara wajib diisi.", 2),
    detail_peserta_audiens: z.string().optional()
  }),

  media_partner: z.object({
    fakultas_organisasi: wajib("Fakultas/Organisasi/Unit wajib diisi.", 2),
    email: z.string().email("Email tidak valid."),
    nama_acara: wajib("Nama acara wajib diisi.", 2),
    tanggal_request_upload: wajib("Hari dan tanggal request upload wajib diisi."),
    kontak_penanggung_jawab: wajib("Kontak penanggung jawab wajib diisi.", 2)
  }),

  kerjasama: z.object({
    fakultas_organisasi: wajib("Fakultas/Organisasi/Unit wajib diisi.", 2),
    email: z.string().email("Email tidak valid."),
    nama_acara: wajib("Nama acara wajib diisi.", 2),
    tanggal_request_upload: z.string().optional(),
    kontak_penanggung_jawab: wajib("Kontak penanggung jawab wajib diisi.", 2)
  }),

  peminjaman_podcast: z.object({
    nama_instansi: wajib("Nama organisasi/instansi wajib diisi.", 2),
    nama_acara: wajib("Nama acara/tujuan peminjaman wajib diisi.", 2),
    tanggal_peminjaman: wajib("Tanggal peminjaman wajib diisi."),
    waktu_mulai: wajib("Waktu mulai wajib diisi."),
    waktu_selesai: wajib("Waktu selesai wajib diisi."),
    kontak_penanggung_jawab: wajib("Kontak penanggung jawab wajib diisi.", 2),
    note_detail: wajib("Note detail wajib diisi.", 2),
    email: z.string().email("Email tidak valid.")
  })
} satisfies Record<JenisPermohonan, z.ZodTypeAny>;

export type SkemaPermohonan = (typeof skemaPermohonan)[JenisPermohonan];

/**
 * Nama field kontak milik sebuah jenis, diambil dari definisi form.
 *
 * Field kontak ditandai publicOnly di lib/permohonan-form.ts karena record
 * manual tidak punya kontak pemohon, jadi field tersebut tidak boleh tampil di
 * form admin create dan tidak ikut divalidasi. Daftar diambil dari definisi
 * form, bukan ditulis ulang di sini, supaya menambah field kontak baru cukup
 * menambah satu publicOnly di sana dan tidak bisa lolos ke form admin.
 *
 * Field file publicOnly tidak termasuk karena tidak pernah ada di skema.
 */
function getKontakNames(jenis: JenisPermohonan): string[] {
  return PERMOHONAN_FORM[jenis].fields
    .filter((field) => field.publicOnly && field.type !== "file")
    .map((field) => field.name);
}

/**
 * Versi admin: field kontak tidak ada di formulir, jadi ikut dibuang dari
 * skema. Field lain tetap divalidasi identik dengan formulir publik.
 */
export function getSkemaAdmin(jenis: JenisPermohonan): z.ZodTypeAny {
  const base = skemaPermohonan[jenis] as z.ZodObject<z.ZodRawShape>;
  const shape: z.ZodRawShape = { ...base.shape };
  for (const name of getKontakNames(jenis)) delete shape[name];
  return z.object(shape);
}

/**
 * Versi edit: seperti versi admin, tapi field kontak ikut dikembalikan ketika
 * withKontak benar, karena notifikasi perubahan memang butuh kontak pemohon.
 * Field kontak diambil kembali dari skema publik, bukan ditulis ulang, sehingga
 * aturan validasinya tidak mungkin melenceng dari formulir publik. Validasi
 * domain kampus tetap di route, sama seperti formulir publik, karena
 * isAllowedCampusEmail() butuh daftar domain env.
 */
export function getSkemaEdit(jenis: JenisPermohonan, withKontak: boolean): z.ZodTypeAny {
  const base = getSkemaAdmin(jenis) as z.ZodObject<z.ZodRawShape>;
  if (!withKontak) return base;

  const penuh = skemaPermohonan[jenis] as z.ZodObject<z.ZodRawShape>;
  const shape: z.ZodRawShape = { ...base.shape };
  for (const name of getKontakNames(jenis)) {
    if (penuh.shape[name]) shape[name] = penuh.shape[name];
  }
  return z.object(shape);
}

export function isJenisPermohonan(value: unknown): value is JenisPermohonan {
  return typeof value === "string" && (JENIS_OPTIONS as readonly string[]).includes(value);
}

/** Ambil payload tervalidasi dari FormData sesuai field yang ada di skema. */
export function parsePayload(formData: FormData, schema: z.ZodTypeAny) {
  const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    const value = formData.get(key);
    raw[key] = value === null || value === "" ? undefined : value;
  }
  return schema.parse(raw);
}

export class FileWajibError extends Error {}

/**
 * Ambil seluruh field file milik sebuah jenis dari FormData. Field yang tidak
 * ada atau kosong ditolak dengan pesan yang menyebut nama field, sehingga route
 * tidak perlu cabang if per jenis hanya untuk pesan error upload.
 */
export function pickFiles(formData: FormData, jenis: JenisPermohonan): File[] {
  const files: File[] = [];
  for (const field of getFileFields(jenis)) {
    const value = formData.get(field.name);
    if (!(value instanceof File) || value.size === 0) {
      throw new FileWajibError(`${field.label} wajib diunggah.`);
    }
    files.push(value);
  }
  return files;
}

/**
 * Versi longgar dari pickFiles untuk penggantian lampiran oleh admin: field
 * yang kosong berarti "jangan ganti", bukan error. Field def ikut dikembalikan
 * supaya route bisa memakai aturan pdfOnly milik field tersebut.
 */
export function pickFilesOptional(formData: FormData, jenis: JenisPermohonan) {
  const files: { field: FieldDef; file: File }[] = [];
  for (const field of getFileFields(jenis)) {
    const value = formData.get(field.name);
    if (value instanceof File && value.size > 0) files.push({ field, file: value });
  }
  return files;
}
