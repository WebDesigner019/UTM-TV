"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StatusPermohonan } from "@prisma/client";
import { Save } from "lucide-react";
import { STATUS_LABEL, STATUS_OPTIONS } from "@/lib/status";

export function StatusForm({
  id,
  jenis,
  status,
  pesanPemohon,
  catatanInternal
}: {
  id: number;
  jenis: string;
  status: StatusPermohonan;
  pesanPemohon?: string | null;
  catatanInternal?: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch(`/api/admin/permohonan/${id}?jenis=${jenis}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        pesan_pemohon: form.get("pesan_pemohon"),
        catatan_internal: form.get("catatan_internal")
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Perubahan gagal disimpan.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      <h2 className="text-xl font-bold tracking-tight text-ink">Ubah status</h2>
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink">Status</label>
        <select className="focus-ring input-field" name="status" defaultValue={status}>
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {STATUS_LABEL[item]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink">Pesan untuk pemohon</label>
        <textarea
          className="focus-ring input-field min-h-28"
          name="pesan_pemohon"
          defaultValue={pesanPemohon || ""}
          placeholder="Pesan ini tampil di halaman lacak dan dikirim melalui email."
        />
      </div>
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink">Catatan internal</label>
        <textarea
          className="focus-ring input-field min-h-28"
          name="catatan_internal"
          defaultValue={catatanInternal || ""}
          placeholder="Catatan ini hanya terlihat oleh admin."
        />
      </div>
      <button className="btn-primary w-full">
        <Save className="h-4 w-4" />
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}