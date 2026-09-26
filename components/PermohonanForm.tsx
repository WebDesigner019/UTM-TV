"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { FormField, FileInput, TextareaField } from "@/components/FormField";
import { JENIS_TITLE, STATUS_LABEL, STATUS_OPTIONS, todayISO, type JenisPermohonan } from "@/lib/status";
import {
  ACCEPT_DOC_IMAGE,
  ACCEPT_PDF,
  MAX_FILE_SIZE_MB_FALLBACK,
  getSubmitEndpoint,
  getVisibleFields,
  type FieldDef,
  type FormVariant
} from "@/lib/permohonan-form";

export type PermohonanSubmitResult = {
  id: number;
  nomorRujukan: string;
  jenis: JenisPermohonan;
};

type Props = {
  jenis: JenisPermohonan;
  variant: FormVariant;
  /** Batas ukuran unggahan dalam MB. Hanya relevan untuk variant public. */
  maxSizeMb?: number;
  /** Hanya untuk variant admin. */
  onSuccess?: (result: PermohonanSubmitResult) => void;
  /** Hanya untuk variant admin: tampilkan select status awal. */
  showStatusAwal?: boolean;
  /** Hanya untuk variant admin: tombol kembali ke langkah sebelumnya. */
  onBack?: () => void;
  className?: string;
  submitLabel?: string;
};

function renderField(field: FieldDef, maxSizeMb: number | undefined, minToday: boolean) {
  if (field.type === "file") {
    const accept = field.pdfOnly ? ACCEPT_PDF : ACCEPT_DOC_IMAGE;
    return (
      <FileInput
        key={field.name}
        accept={accept}
        hint={
          field.pdfOnly
            ? `Format PDF. Maksimal ${maxSizeMb} MB.`
            : `Format PDF, DOC, DOCX, JPG, atau PNG. Maksimal ${maxSizeMb} MB.`
        }
        label={field.label}
        maxSizeMb={maxSizeMb ?? MAX_FILE_SIZE_MB_FALLBACK}
        name={field.name}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <TextareaField
        key={field.name}
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
      hint={field.hint}
      label={field.label}
      min={field.minToday && minToday ? todayISO() : undefined}
      name={field.name}
      placeholder={field.placeholder}
      required={field.required !== false}
      type={field.type}
    />
  );
}

/**
 * Satu-satunya implementasi formulir pengajuan. Dipakai oleh halaman publik
 * (/ajukan/*) dan oleh modal input manual admin, sehingga definisi field,
 * upload, dan alur submit tidak terduplikasi.
 */
export function PermohonanForm({
  jenis,
  variant,
  maxSizeMb,
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
  const fields = getVisibleFields(jenis, variant);
  const label = submitLabel || (isAdmin ? "Simpan Data" : "Kirim Permohonan");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    if (!isAdmin) {
      const email = String(formData.get("email") || "").toLowerCase();
      if (!email.endsWith("@student.trunojoyo.ac.id") && !email.endsWith("@trunojoyo.ac.id")) {
        setError("Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id.");
        setLoading(false);
        return;
      }
    }

    if (isAdmin) formData.set("jenis", jenis);

    let response: Response;
    try {
      response = await fetch(getSubmitEndpoint(jenis, variant), {
        method: "POST",
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

    if (isAdmin) {
      onSuccess?.({
        id: Number(data.id),
        nomorRujukan: data.nomor_rujukan,
        jenis
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

      {showStatusAwal ? (
        <div>
          <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor="status_awal">
            Status awal
          </label>
          <select className="focus-ring input-field" defaultValue="diterima" id="status_awal" name="status_awal">
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[13px] text-slate-500">
            Pilih status sesuai kondisi saat data dicatat, bukan selalu &quot;Pengajuan masuk&quot;.
          </p>
        </div>
      ) : null}

      {rows.map((row, index) =>
        row.length === 2 ? (
          <div className="grid gap-5 sm:grid-cols-2" key={`row-${index}`}>
            {row.map((field) => renderField(field, maxSizeMb, !isAdmin))}
          </div>
        ) : (
          <div key={`row-${index}`}>{row.map((field) => renderField(field, maxSizeMb, !isAdmin))}</div>
        )
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {onBack ? (
          <button className="btn-secondary" onClick={onBack} type="button">
            <ArrowLeft className="h-4 w-4" />
            Ganti jenis
          </button>
        ) : null}
        <button className="btn-primary py-3 sm:w-52" disabled={loading} type="submit">
          {isAdmin ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {loading ? "Menyimpan..." : label}
        </button>
        <span className="text-[13px] text-slate-400">{JENIS_TITLE[jenis]}</span>
      </div>
    </form>
  );
}
