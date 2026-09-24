"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { FormField, FileInput } from "@/components/FormField";

export function KerjasamaForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/permohonan/kerjasama", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Permohonan gagal dikirim.");
      return;
    }

    router.push(`/ajukan/sukses?nomor=${encodeURIComponent(data.nomor_rujukan)}&jenis=kerjasama`);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <FormField
        label="Fakultas/Organisasi/Unit Penyelenggara Acara"
        name="fakultas_organisasi"
        placeholder="Contoh: UTM TV/BEM Fakultas, dst."
      />
      <FormField label="Nama Acara" name="nama_acara" placeholder="Contoh: Donor Darah Bersama 2026" />
      <FormField
        label="Hari dan Tanggal Request Upload"
        name="tanggal_request_upload"
        type="date"
        min={new Date().toISOString().split("T")[0]}
        required={false}
      />
      <FormField
        label="Kontak Penanggung Jawab"
        name="kontak_penanggung_jawab"
        placeholder="Contoh: +62812345678 (Akbar/Himpunan Mahasiswa Sistem Informasi (+628573022837))"
        hint="Usahakan dapat dikontak via WhatsApp."
      />
      <FileInput
        label="Surat Permohonan Kerjasama"
        name="surat_kerjasama"
        hint="Format PDF, DOC, DOCX, JPG, atau PNG. Maksimal 5 MB."
      />
      <button disabled={loading} className="btn-primary w-full py-3 sm:w-52">
        <Send className="h-4 w-4" />
        {loading ? "Mengirim..." : "Kirim Permohonan"}
      </button>
    </form>
  );
}