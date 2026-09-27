import { prisma } from "@/lib/prisma";
import { isAllowedCampusEmail, normalizeEmail } from "@/lib/env";
import { getEditableFields, getFileFields, toDateInputValue, type FieldDef } from "@/lib/permohonan-form";
import { getPermohonanDelegate, getRiwayatDelegate } from "@/lib/permohonan-record";
import { getSkemaEdit, parsePayload, pickFilesOptional } from "@/lib/permohonan-schema";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/upload";
import { formatTanggal, type JenisPermohonan } from "@/lib/status";

/** Satu field yang berubah, sudah diformat untuk dibaca pemohon. */
export type PerubahanData = {
  label: string;
  dari: string;
  ke: string;
};

export class PermohonanEditError extends Error {}

type FileTerunggah = {
  field: FieldDef;
  relativePath: string;
  originalName: string;
};

function formatNilai(field: FieldDef, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (field.type === "date") return formatTanggal(value as Date);
  return String(value);
}

/**
 * Bandingkan nilai lama dengan payload baru untuk menghasilkan daftar
 * perubahan. Field yang isinya sama persis tidak masuk daftar, sehingga
 * menyimpan form tanpa menyentuh apa pun tidak memicu notifikasi.
 */
function hitungPerubahan(
  existing: Record<string, any>,
  fields: FieldDef[],
  data: Record<string, unknown>
): PerubahanData[] {
  const perubahan: PerubahanData[] = [];

  for (const field of fields) {
    if (!field.column) continue;
    const dari = formatNilai(field, existing[field.column]);
    const ke = formatNilai(field, data[field.column]);
    if (dari === ke) continue;
    perubahan.push({ label: field.label, dari, ke });
  }

  return perubahan;
}

/** Nilai form untuk prefill modal Ubah Data, diambil dari record database. */
export function getFormValuesFromRecord(
  jenis: JenisPermohonan,
  record: Record<string, any>,
  withKontak: boolean
): Record<string, string> {
  const values: Record<string, string> = {};

  for (const field of getEditableFields(jenis, withKontak)) {
    const raw = field.column ? record[field.column] : undefined;
    values[field.name] =
      field.type === "date" ? toDateInputValue(raw) : raw === null || raw === undefined ? "" : String(raw);
  }

  return values;
}

/** Nama lampiran yang tersimpan per field file, untuk ditampilkan di modal. */
export function getCurrentFileNames(
  jenis: JenisPermohonan,
  record: Record<string, any>
): Record<string, string> {
  const names: Record<string, string> = {};

  for (const field of getFileFields(jenis)) {
    const name = field.fileColumns ? record[field.fileColumns.originalName] : null;
    if (name) names[field.name] = String(name);
  }

  return names;
}

/**
 * Ubah data permohonan oleh admin.
 *
 * Berbeda dengan pembuatan manual, data yang sudah ada tetap utuh: nomor
 * rujukan, status, pesan pemohon, dan catatan internal tidak disentuh karena
 * bukan milik form ini. Status dan pesan tetap punya Jalurnya sendiri lewat
 * PATCH / StatusForm.
 *
 * Field kontak hanya ikut dibuka untuk record yang bukan input manual. Record
 * manual tidak punya kontak pemohon dan sesuai requirement tidak pernah
 * memicu notifikasi, jadi kolomnya tidak dibuka walau request memaksanya.
 *
 * Setiap perubahan yang benar-benar terjadi dicatat satu baris di
 * status_history dengan statusLama = statusBaru. Riwayat perubahan data pun
 * jadi terlihat di timeline "Riwayat status" tanpa perlu tabel baru.
 */
export async function updatePermohonanData(input: {
  jenis: JenisPermohonan;
  id: number;
  formData: FormData;
  admin: { id: number; nama: string };
}): Promise<{
  updated: Record<string, any>;
  perubahan: PerubahanData[];
  perubahanLampiran: { label: string; dari: string; ke: string }[];
  nomorRujukan: string;
  withKontak: boolean;
}> {
  const { jenis, id, formData, admin } = input;

  const existing = await getPermohonanDelegate(jenis).findUnique({ where: { id } });
  if (!existing) throw new PermohonanEditError("Data tidak ditemukan.");

  const withKontak = !existing.inputManuallyEntered;
  const fields = getEditableFields(jenis, withKontak);
  const payload = parsePayload(formData, getSkemaEdit(jenis, withKontak)) as Record<
    string,
    string | undefined
  >;

  if (withKontak && payload.email) {
    const email = normalizeEmail(payload.email);
    if (!isAllowedCampusEmail(email)) {
      throw new PermohonanEditError(
        "Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id."
      );
    }
    payload.email = email;
  }

  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (!field.column) continue;
    const value = payload[field.name];
    data[field.column] = field.type === "date" ? (value ? new Date(value) : null) : value || null;
  }

  const perubahan = hitungPerubahan(existing, fields, data);
  const terunggah: FileTerunggah[] = [];
  const perubahanLampiran: PerubahanData[] = [];

  try {
    for (const { field, file } of pickFilesOptional(formData, jenis)) {
      if (!field.fileColumns) continue;

      const info = await saveUploadedFile(file, { pdfOnly: field.pdfOnly });
      terunggah.push({ field, relativePath: info.relativePath, originalName: info.originalName });

      const lama = (existing[field.fileColumns.originalName] as string | null) ?? null;
      if (lama && lama !== info.originalName) {
        perubahanLampiran.push({ label: field.label, dari: lama, ke: info.originalName });
      } else if (!lama) {
        perubahanLampiran.push({ label: field.label, dari: "-", ke: info.originalName });
      }

      data[field.fileColumns.path] = info.relativePath;
      data[field.fileColumns.originalName] = info.originalName;
      data[field.fileColumns.mimeType] = info.mimeType;
      data[field.fileColumns.sizeBytes] = info.sizeBytes;
    }

    // Tidak ada satu pun field yang berubah: jangan sentuh database dan
    // jangan kirim notifikasi, cuma kembalikan record apa adanya.
    if (perubahan.length === 0 && terunggah.length === 0) {
      return {
        updated: existing,
        perubahan,
        perubahanLampiran,
        nomorRujukan: existing.nomorRujukan,
        withKontak
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const item = await getPermohonanDelegate(jenis, tx).update({ where: { id }, data });

      const rincian = [
        ...perubahan.map((item) => `${item.label}: "${item.dari}" -> "${item.ke}"`),
        ...perubahanLampiran.map((item) => `${item.label}: "${item.dari}" -> "${item.ke}"`)
      ];

      await getRiwayatDelegate(jenis, tx).create({
        data: {
          permohonanId: id,
          statusLama: existing.status,
          statusBaru: existing.status,
          changedByAdminId: admin.id,
          pesan: [
            `Data diperbarui oleh ${admin.nama}, status tidak berubah.`,
            ...rincian
          ].join(" ")
        }
      });

      return item;
    });

    // Berkas lama baru dihapus setelah transaksi selesai, supaya kegagalan
    // update tidak membuat record menunjuk berkas yang sudah terhapus.
    await Promise.all(
      terunggah
        .filter((item) => item.field.fileColumns)
        .map((item) => {
          const lama = existing[item.field.fileColumns!.path] as string | null | undefined;
          return deleteUploadedFile(lama && lama !== item.relativePath ? lama : null);
        })
    );

    return {
      updated,
      perubahan,
      perubahanLampiran,
      nomorRujukan: updated.nomorRujukan,
      withKontak
    };
  } catch (error) {
    // Berkas baru yang sudah tersimpan tidak boleh menggantung di storage
    // kalau update-nya gagal.
    await Promise.all(terunggah.map((item) => deleteUploadedFile(item.relativePath)));
    throw error;
  }
}
