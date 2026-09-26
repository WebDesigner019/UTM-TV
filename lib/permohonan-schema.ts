import { z } from "zod";
import { JENIS_OPTIONS, type JenisPermohonan } from "@/lib/status";
import { getFileFields } from "@/lib/permohonan-form";

const wajib = (message: string, min = 1) => z.string().min(min, message);

export const skemaPermohonan = {
  liputan: z.object({
    nama_instansi: wajib("Nama instansi wajib diisi.", 2),
    email: z.string().email("Email tidak valid."),
    no_wa: wajib("No. WhatsApp wajib diisi."),
    nama_acara: wajib("Nama acara wajib diisi.", 2),
    tanggal_acara: wajib("Tanggal acara wajib diisi."),
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
 * Versi admin: email dan no_wa tidak ada di formulir, jadi ikut dibuang dari
 * skema. Field lain tetap divalidasi identik dengan formulir publik.
 */
export function getSkemaAdmin(jenis: JenisPermohonan): z.ZodTypeAny {
  const base = skemaPermohonan[jenis] as z.ZodObject<z.ZodRawShape>;
  const shape: z.ZodRawShape = { ...base.shape };
  delete shape.email;
  delete shape.no_wa;
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
