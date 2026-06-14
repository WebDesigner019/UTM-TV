"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export function AjukanForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").toLowerCase();
    if (!email.endsWith("@student.trunojoyo.ac.id") && !email.endsWith("@trunojoyo.ac.id")) {
      setError("Gunakan email kampus @student.trunojoyo.ac.id atau @trunojoyo.ac.id.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/permohonan", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Permohonan gagal dikirim.");
      return;
    }

    router.push(`/ajukan/sukses?nomor=${encodeURIComponent(data.nomor_rujukan)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded border border-line bg-white p-5">
      {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Field label="Nama instansi/kantor/prodi/unit kampus" name="nama_instansi" />
      <Field label="Email kampus" name="email" type="email" placeholder="nama@student.trunojoyo.ac.id" />
      <Field label="No. WhatsApp" name="no_wa" type="tel" placeholder="08123456789" />
      <Field label="Nama acara" name="nama_acara" />
      <Field label="Tanggal acara" name="tanggal_acara" type="date" min={new Date().toISOString().split("T")[0]} />
      <Field label="Tempat acara" name="tempat_acara" />
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="detail_peserta_audiens">
          Detail Peserta/Audiens
        </label>
        <textarea
          className="focus-ring w-full rounded border border-line bg-white px-3 py-2 text-sm"
          id="detail_peserta_audiens"
          name="detail_peserta_audiens"
          rows={3}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Surat pengajuan</label>
        <input
          className="focus-ring w-full rounded border border-line bg-white px-3 py-2 text-sm"
          name="surat_pengajuan"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
          required
        />
        <p className="mt-2 text-xs text-slate-500">Format PDF, DOC, DOCX, JPG, atau PNG. Maksimal 10 MB.</p>
      </div>
      <button
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        <Send className="h-4 w-4" />
        {loading ? "Mengirim..." : "Kirim Permohonan"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  min
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        className="focus-ring w-full rounded border border-line bg-white px-3 py-2"
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        min={min}
        required
      />
    </div>
  );
}
