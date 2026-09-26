"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { FormField, FileInput } from "@/components/FormField";

export function AjukanForm({ maxSizeMb }: { maxSizeMb: number }) {
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

    const response = await fetch("/api/permohonan/liputan", {
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
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <FormField label="Nama instansi/kantor/prodi/unit kampus" name="nama_instansi" />
      <FormField label="Email kampus" name="email" type="email" placeholder="nama@student.trunojoyo.ac.id" />
      <FormField label="No. WhatsApp" name="no_wa" type="tel" placeholder="08123456789" />
      <FormField label="Nama acara" name="nama_acara" />
      <FormField label="Tanggal acara" name="tanggal_acara" type="date" min={new Date().toISOString().split("T")[0]} />
      <FormField label="Tempat acara" name="tempat_acara" />
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor="detail_peserta_audiens">
          Detail Peserta/Audiens
        </label>
        <textarea
          className="focus-ring input-field"
          id="detail_peserta_audiens"
          name="detail_peserta_audiens"
          rows={3}
        />
      </div>
      <FileInput
        label="Surat pengajuan"
        name="surat_pengajuan"
        maxSizeMb={maxSizeMb}
        hint={`Format PDF, DOC, DOCX, JPG, atau PNG. Maksimal ${maxSizeMb} MB.`}
      />
      <button disabled={loading} className="btn-primary w-full py-3 sm:w-52">
        <Send className="h-4 w-4" />
        {loading ? "Mengirim..." : "Kirim Permohonan"}
      </button>
    </form>
  );
}