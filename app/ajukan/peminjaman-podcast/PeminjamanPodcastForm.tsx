"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { FormField, FileInput } from "@/components/FormField";

export function PeminjamanPodcastForm() {
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

    const response = await fetch("/api/permohonan/peminjaman-podcast", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Permohonan gagal dikirim.");
      return;
    }

    router.push(`/ajukan/sukses?nomor=${encodeURIComponent(data.nomor_rujukan)}&jenis=peminjaman_podcast`);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <FormField
        label="Nama Organisasi/Instansi"
        name="nama_instansi"
        placeholder="Contoh: Fakultas, BEM, dsb."
      />
      <FormField
        label="Nama Acara/Tujuan Peminjaman"
        name="nama_acara"
        placeholder="Contoh: Diskusi dengan rektor, podcast ramadhan"
      />
      <FormField
        label="Tanggal Peminjaman"
        name="tanggal_peminjaman"
        type="date"
        min={new Date().toISOString().split("T")[0]}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Waktu Mulai" name="waktu_mulai" type="time" />
        <FormField label="Waktu Selesai" name="waktu_selesai" type="time" />
      </div>
      <FormField
        label="Kontak Penanggung Jawab"
        name="kontak_penanggung_jawab"
        placeholder="Contoh: +62812345678 (Nama Penanggung Jawab)"
        hint="Nomor WhatsApp aktif dan nama penanggung jawab."
      />
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor="note_detail">
          Note Detail
        </label>
        <textarea
          className="focus-ring input-field"
          id="note_detail"
          name="note_detail"
          rows={4}
          placeholder="Apa saja yang akan dilakukan dan siapa saja yang terlibat."
        />
      </div>
      <FormField label="Email Kampus" name="email" type="email" placeholder="nama@student.trunojoyo.ac.id" />
      <FileInput
        label="Surat Rekomendasi BAKK"
        name="surat_rekom_bakk"
        accept=".pdf,application/pdf"
        hint="Format PDF. Maksimal 10 MB."
      />
      <FileInput
        label="Surat Pernyataan"
        name="surat_pernyataan"
        accept=".pdf,application/pdf"
        hint="Format PDF. Maksimal 10 MB."
      />
      <button disabled={loading} className="btn-primary w-full py-3 sm:w-52">
        <Send className="h-4 w-4" />
        {loading ? "Mengirim..." : "Kirim Permohonan"}
      </button>
    </form>
  );
}