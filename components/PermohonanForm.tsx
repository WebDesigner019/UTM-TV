"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BellRing, CheckCircle2, Send } from "lucide-react";
import { FormField, FileInput, TextareaField } from "@/components/FormField";
import {
  JENIS_TITLE,
  STATUS_AWAL_ADMIN,
  STATUS_LABEL,
  STATUS_OPTIONS,
  todayISO,
  type JenisPermohonan
} from "@/lib/status";
import {
  ACCEPT_DOC_IMAGE,
  ACCEPT_PDF,
  MAX_FILE_SIZE_MB_FALLBACK,
  getEditEndpoint,
  getEditableFields,
  getFileFields,
  getSubmitEndpoint,
  getVisibleFields,
  type FieldDef,
  type FormVariant
} from "@/lib/permohonan-form";

export type PermohonanSubmitResult = {
  id: number;
  nomorRujukan: string;
  jenis: JenisPermohonan;
  /** Nama field yang berubah, hanya untuk variant edit. */
  perubahan?: string[];
  notifikasi?: string;
};

type Props = {
  jenis: JenisPermohonan;
  variant: FormVariant;
  /** Batas ukuran unggahan dalam MB. Hanya relevan untuk variant public. */
  maxSizeMb?: number;
  /** Isi awal field, dipakai untuk prefill variant edit. */
  defaultValues?: Record<string, string>;
  /** Id record yang diubah, wajib untuk variant edit. */
  recordId?: number;
  /** Tampilkan field kontak. Hanya variant edit. */
  showKontak?: boolean;
  /** Data ini dicatat manual, jadi tidak ada kontak dan tidak ada notifikasi. */
  tanpaNotifikasi?: boolean;
  /** Nama lampiran tersimpan per field file, dipakai variant edit. */
  currentFiles?: Record<string, string>;
  /** Hanya untuk variant admin dan edit. */
  onSuccess?: (result: PermohonanSubmitResult) => void;
  /** Hanya untuk variant admin: tampilkan select status awal. */
  showStatusAwal?: boolean;
  /** Tombol kembali, mis. ganti jenis atau tutup modal. */
  onBack?: () => void;
  className?: string;
  submitLabel?: string;
};

type RenderContext = {
  maxSizeMb: number | undefined;
  minToday: boolean;
  defaultValue?: string;
  currentFileName?: string;
  fileRequired: boolean;
};

function renderField(field: FieldDef, ctx: RenderContext) {
  if (field.type === "file") {
    const accept = field.pdfOnly ? ACCEPT_PDF : ACCEPT_DOC_IMAGE;
    return (
      <FileInput
        key={field.name}
        accept={accept}
        currentFileName={ctx.currentFileName}
        hint={
          field.pdfOnly
            ? `Format PDF. Maksimal ${ctx.maxSizeMb} MB.`
            : `Format PDF, DOC, DOCX, JPG, atau PNG. Maksimal ${ctx.maxSizeMb} MB.`
        }
        label={field.label}
        maxSizeMb={ctx.maxSizeMb ?? MAX_FILE_SIZE_MB_FALLBACK}
        name={field.name}
        required={ctx.fileRequired}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <TextareaField
        key={field.name}
        defaultValue={ctx.defaultValue}
        hint={field.hint}
        label={field.label}
        name={field.name}
        placeholder={field.placeholder}
        required={field.required !== false}
        rows={field.rows}
      />
    );
  }

  return (
    <FormField
      key={field.name}
      defaultValue={ctx.defaultValue}
      hint={field.hint}
      label={field.label}
      min={field.minToday && ctx.minToday ? todayISO() : undefined}
      name={field.name}
      placeholder={field.placeholder}
      required={field.required !== false}
      type={field.type}
    />
  );
}

/**
 * Satu-satunya implementasi formulir pengajuan. Dipakai oleh halaman publik
 * (/ajukan/*), modal input manual admin, dan modal ubah data admin, sehingga
 * definisi field, upload, dan alur submit tidak terduplikasi.
 */
export function PermohonanForm({
  jenis,
  variant,
  maxSizeMb,
  defaultValues,
  recordId,
  showKontak = false,
  tanpaNotifikasi = false,
  currentFiles,
  onSuccess,
  showStatusAwal = false,
  onBack,
  className = "card space-y-5 p-6 sm:p-8",
  submitLabel
}: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = variant === "admin";
  const isEdit = variant === "edit";

  const fields = isEdit
    ? [...getEditableFields(jenis, showKontak), ...getFileFields(jenis)]
    : getVisibleFields(jenis, isAdmin ? "admin" : "public");

  const label =
    submitLabel || (isEdit ? "Simpan Perubahan" : isAdmin ? "Simpan Data" : "Kirim Permohonan");

  // minToday hanya untuk formulir publik. Form admin boleh mengisi tanggal
  // lampau, dan saat mengubah data yang acaranya sudah lewat admin justru
  // perlu bisa mengoreksinya.
  const minToday = !isAdmin && !isEdit;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    if (!isAdmin && !isEdit) {
      const email = String(formData.get("email") || "").toLowerCase();
      if (!email.endsWith("@student.trunojoyo.ac.id") && !email.endsWith("@trunojoyo.ac.id")) {
        setError("Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id.");
        setLoading(false);
        return;
      }
    }

    if (isAdmin) formData.set("jenis", jenis);

    const endpoint = isEdit
      ? getEditEndpoint(jenis, recordId ?? 0)
      : getSubmitEndpoint(jenis, isAdmin ? "admin" : "public");

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        body: formData
      });
    } catch {
      setError("Permohonan gagal dikirim. Periksa koneksi Anda.");
      setLoading(false);
      return;
    }

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Permohonan gagal dikirim.");
      return;
    }

    if (isAdmin || isEdit) {
      onSuccess?.({
        id: Number(data.id ?? recordId),
        nomorRujukan: data.nomor_rujukan,
        jenis,
        perubahan: data.perubahan,
        notifikasi: data.notifikasi
      });
      return;
    }

    router.push(`/ajukan/sukses?nomor=${encodeURIComponent(data.nomor_rujukan)}&jenis=${jenis}`);
  }

  // Kelompokkan field ber-half yang berurutan agar dirender dua kolom.
  const rows: FieldDef[][] = [];
  for (const field of fields) {
    if (field.half) {
      const last = rows[rows.length - 1];
      if (last && last.length < 2 && last.every((item) => item.half)) last.push(field);
      else rows.push([field]);
    } else {
      rows.push([field]);
    }
  }

  return (
    <form className={className} onSubmit={onSubmit}>
      {error ? (
        <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isAdmin ? (
        <div className="rounded-xl border border-brand/25 bg-brand/5 px-4 py-3 text-[13px] leading-5 text-ink">
          Data dicatat atas nama admin, tanpa email, nomor WhatsApp, maupun lampiran surat. Karena
          tidak ada kontak pemohon, tidak ada notifikasi email atau WhatsApp yang dikirim untuk data
          ini.
        </div>
      ) : null}

      {isEdit ? (
        <div className="rounded-xl border border-brand/25 bg-brand/5 px-4 py-3 text-[13px] leading-5 text-ink">
          {tanpaNotifikasi
            ? "Data ini dicatat manual oleh admin dan tidak punya kontak pemohon, jadi tidak ada email atau WhatsApp yang dikirim."
            : "Nomor rujukan dan status tidak diubah dari sini. Setelah disimpan, pemohon diberi tahu melalui email dan WhatsApp dengan daftar field yang berubah."}
        </div>
      ) : null}

      {isEdit && !tanpaNotifikasi ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white/70 px-4 py-3">
          <input
            className="mt-1 h-4 w-4 shrink-0 rounded border-line text-brand focus:ring-brand"
            defaultChecked
            name="kirim_notifikasi"
            type="checkbox"
            value="1"
          />
          <span>
            <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
              <BellRing className="h-4 w-4 text-brand" />
              Kirim notifikasi ke pemohon
            </span>
            <span className="mt-0.5 block text-[13px] leading-5 text-slate-500">
              Berisi daftar field yang berubah. Lepas centang bila hanya ingin menyimpan tanpa
              memberi tahu.
            </span>
          </span>
        </label>
      ) : null}

      {showStatusAwal ? (
        <div>
          <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor="status_awal">
            Status awal
          </label>
          <select
            className="focus-ring input-field"
            defaultValue={STATUS_AWAL_ADMIN}
            id="status_awal"
            name="status_awal"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[13px] text-slate-500">
            Bawaannya &quot;{STATUS_LABEL[STATUS_AWAL_ADMIN]}&quot;. Pilih status lain bila
            data dicatat dengan kondisi yang berbeda.
          </p>
        </div>
      ) : null}

      {rows.map((row, index) => {
        const ctxFor = (field: FieldDef): RenderContext => ({
          maxSizeMb,
          minToday,
          defaultValue: isEdit ? defaultValues?.[field.name] : undefined,
          currentFileName: isEdit ? currentFiles?.[field.name] : undefined,
          // Saat mengganti lampiran, berkas boleh dikosongkan karena artinya
          // "pertahankan yang sekarang".
          fileRequired: !isEdit
        });

        return row.length === 2 ? (
          <div className="grid gap-5 sm:grid-cols-2" key={`row-${index}`}>
            {row.map((field) => renderField(field, ctxFor(field)))}
          </div>
        ) : (
          <div key={`row-${index}`}>{row.map((field) => renderField(field, ctxFor(field)))}</div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {onBack ? (
          <button className="btn-secondary" onClick={onBack} type="button">
            <ArrowLeft className="h-4 w-4" />
            {isEdit ? "Batal" : "Ganti jenis"}
          </button>
        ) : null}
        <button className="btn-primary py-3 sm:w-52" disabled={loading} type="submit">
          {isAdmin || isEdit ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {loading ? "Menyimpan..." : label}
        </button>
        <span className="text-[13px] text-slate-400">{JENIS_TITLE[jenis]}</span>
      </div>
    </form>
  );
}
