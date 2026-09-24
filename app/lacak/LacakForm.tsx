"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { STATUS_LABEL, formatTanggal, formatTanggalWaktu } from "@/lib/status";
import { StatusBadge, StatusIcon } from "@/components/StatusBadge";
import type { StatusPermohonan } from "@prisma/client";

type Result = {
  nomorRujukan: string;
  namaInstansi?: string;
  fakultasOrganisasi?: string;
  noWa?: string;
  namaAcara: string;
  tanggalAcara?: string;
  tanggalRequestUpload?: string | null;
  tempatAcara?: string;
  kontakPenanggungJawab?: string;
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

const JENIS_OPTIONS = [
  { value: "liputan", label: "Pengajuan Liputan" },
  { value: "media_partner", label: "Pengajuan Media Partner" },
  { value: "kerjasama", label: "Pengajuan Kerjasama" }
] as const;

export function LacakForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [jenis, setJenis] = useState<string>("liputan");

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
        jenis_permohonan: form.get("jenis_permohonan"),
        nomor_rujukan: form.get("nomor_rujukan"),
        email: form.get("email") || undefined
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
      <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
        {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <div>
          <label className="mb-2 block text-[15px] font-semibold text-ink">Jenis pengajuan</label>
          <select
            className="focus-ring input-field"
            name="jenis_permohonan"
            defaultValue="liputan"
            onChange={(event) => setJenis(event.target.value)}
            required
          >
            {JENIS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[15px] font-semibold text-ink">Nomor rujukan</label>
          <input className="focus-ring input-field uppercase" name="nomor_rujukan" required />
        </div>
        {jenis === "liputan" ? (
          <div>
            <label className="mb-2 block text-[15px] font-semibold text-ink">Email kampus</label>
            <input className="focus-ring input-field" name="email" type="email" required />
          </div>
        ) : null}
        <button className="btn-primary w-full py-3 sm:w-52">
          <Search className="h-4 w-4" />
          {loading ? "Memeriksa..." : "Cek Status"}
        </button>
      </form>

      {result ? (
        <section className="card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-3 border-b border-line/70 pb-5 sm:flex-row">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-wide text-slate-400">{result.nomorRujukan}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">{result.namaAcara}</h2>
              <p className="mt-1.5 text-[15px] text-slate-500">
                {result.namaInstansi || result.fakultasOrganisasi || "-"}
                {result.tanggalAcara ? ` - ${formatTanggal(result.tanggalAcara)}` : ""}
                {result.tanggalRequestUpload ? ` - ${formatTanggal(result.tanggalRequestUpload)}` : ""}
                {result.tempatAcara ? ` - ${result.tempatAcara}` : ""}
              </p>
              {result.noWa ? <p className="text-sm text-slate-400">WA: {result.noWa}</p> : null}
              {result.kontakPenanggungJawab ? <p className="text-sm text-slate-400">Kontak: {result.kontakPenanggungJawab}</p> : null}
            </div>
            <StatusBadge status={result.status} />
          </div>

          {result.pesanPemohon ? (
            <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
              {result.pesanPemohon}
            </div>
          ) : null}

          <h3 className="mt-7 text-lg font-semibold tracking-tight text-ink">Riwayat status</h3>
          <div className="mt-5">
            {result.statusHistory.map((item, index) => (
              <div key={`${item.createdAt}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="h-3 w-3 shrink-0 rounded-full bg-brand ring-4 ring-brand/15" />
                  {index < result.statusHistory.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink"><StatusIcon status={item.statusBaru} /></div>
                  <div className="mt-0.5 text-sm text-slate-400">{formatTanggalWaktu(item.createdAt)}</div>
                  {item.pesan ? <p className="mt-1.5 text-sm leading-6 text-slate-600">{item.pesan}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}