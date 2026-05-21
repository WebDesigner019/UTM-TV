"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { STATUS_LABEL, formatTanggal, formatTanggalWaktu } from "@/lib/status";
import type { StatusPermohonan } from "@prisma/client";

type Result = {
  nomorRujukan: string;
  namaInstansi: string;
  namaAcara: string;
  tanggalAcara: string;
  tempatAcara: string;
  status: StatusPermohonan;
  pesanPemohon?: string | null;
  createdAt: string;
  statusHistory: {
    statusLama?: StatusPermohonan | null;
    statusBaru: StatusPermohonan;
    pesan?: string | null;
    createdAt: string;
  }[];
};

export function LacakForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/lacak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomor_rujukan: form.get("nomor_rujukan"),
        email: form.get("email")
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Data tidak ditemukan.");
      return;
    }

    setResult(data.permohonan);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded border border-line bg-white p-5">
        {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <div>
          <label className="mb-2 block text-sm font-medium">Nomor rujukan</label>
          <input className="focus-ring w-full rounded border border-line px-3 py-2 uppercase" name="nomor_rujukan" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Email kampus</label>
          <input className="focus-ring w-full rounded border border-line px-3 py-2" name="email" type="email" required />
        </div>
        <button className="inline-flex items-center gap-2 rounded bg-brand px-4 py-3 font-semibold text-white hover:bg-teal-800">
          <Search className="h-4 w-4" />
          {loading ? "Memeriksa..." : "Cek Status"}
        </button>
      </form>

      {result ? (
        <section className="rounded border border-line bg-white p-5">
          <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row">
            <div>
              <p className="text-sm text-slate-500">{result.nomorRujukan}</p>
              <h2 className="text-2xl font-semibold">{result.namaAcara}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {result.namaInstansi} - {formatTanggal(result.tanggalAcara)} - {result.tempatAcara}
              </p>
            </div>
            <div className="h-fit rounded bg-teal-50 px-3 py-2 text-sm font-semibold text-brand">
              {STATUS_LABEL[result.status]}
            </div>
          </div>

          {result.pesanPemohon ? (
            <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {result.pesanPemohon}
            </div>
          ) : null}

          <h3 className="mt-6 font-semibold">Riwayat status</h3>
          <div className="mt-4 space-y-4">
            {result.statusHistory.map((item, index) => (
              <div key={`${item.createdAt}-${index}`} className="border-l-2 border-brand pl-4">
                <div className="font-medium">{STATUS_LABEL[item.statusBaru]}</div>
                <div className="text-sm text-slate-500">{formatTanggalWaktu(item.createdAt)}</div>
                {item.pesan ? <p className="mt-1 text-sm text-slate-700">{item.pesan}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
