"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, TriangleAlert, X } from "lucide-react";
import { useModalDismiss } from "@/components/useModalDismiss";
import { getEditEndpoint } from "@/lib/permohonan-form";
import { JENIS_TITLE, type JenisPermohonan } from "@/lib/status";

/** Yang harus diketik admin sebelum tombol hapus boleh ditekan. */
const KATA_KONFIRMASI = "HAPUS";

/**
 * Tombol hapus data pada halaman detail, lengkap dengan konfirmasi.
 *
 * Sengaja modal, bukan window.confirm(): konfirmasi yang hanya bisa dijawab
 * "OK" tidak menjelaskan apa yang ikut terhapus, padahal penghapusan di sini
 * tidak bisa dibatalkan.
 *
 * Konfirmasi dua lapis. Klik "Hapus Data" baru membuka dialog, dan tombol
 * merah tetap mati sampai admin mengetik HAPUS. Alasannya penghapusan ini
 * tidak meninggalkan jejak di aplikasi: tabel status_history ikut cascade,
 * jadi tidak ada tempat untuk membatalkan dari halaman riwayat.
 *
 * Setelah berhasil, halaman detail sudah tidak ada isinya, jadi admin
 * dikembalikan ke dashboard dengan penanda di query param supaya jelas data
 * yang ia hapus memang hilang, bukan gagal dimuat.
 */
export function HapusDataModal({
  id,
  jenis,
  nomorRujukan,
  namaAcara,
  adaLampiran
}: {
  id: number;
  jenis: JenisPermohonan;
  nomorRujukan: string;
  namaAcara: string;
  adaLampiran: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setKonfirmasi("");
    setError("");
  }, []);

  useModalDismiss(open, close);

  // Tutup dialog saat klik tombol di luar card, tapi jangan sampai tombol
  // merah ikut terpicu: selama proses hapus sedang berjalan, satu-satunya
  // jalan keluar adalah hasil akhirnya.
  function onOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    if (loading) return;
    if (event.target === event.currentTarget) close();
  }

  const siapHapus = konfirmasi.trim().toUpperCase() === KATA_KONFIRMASI && !loading;

  async function onHapus() {
    if (!siapHapus) return;

    setError("");
    setLoading(true);

    const response = await fetch(getEditEndpoint(jenis, id), { method: "DELETE" });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setLoading(false);
      setError(data?.message || "Data gagal dihapus.");
      return;
    }

    // Nomor rujukan ikut dibawa supaya dashboard bisa menyebut data mana yang
    // hilang, bukan hanya memberi tahu "ada yang dihapus".
    router.push(`/admin?terhapus=${encodeURIComponent(data?.nomor_rujukan || nomorRujukan)}`);
    router.refresh();
  }

  return (
    <>
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50/70 px-5 py-2.5 text-sm font-semibold text-red-700 backdrop-blur transition-all duration-200 hover:bg-red-100 active:scale-[0.98]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Hapus Data
      </button>

      {open ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={onOverlayClick}
          role="dialog"
        >
          <div className="card my-auto w-full max-w-lg">
            <div className="flex items-start justify-between gap-4 border-b border-line/70 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">Hapus Permohonan?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {nomorRujukan} &middot; {JENIS_TITLE[jenis]}
                </p>
              </div>
              <button
                aria-label="Tutup"
                className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-50"
                disabled={loading}
                onClick={close}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex gap-3 rounded-2xl border border-red-200/80 bg-red-50/70 px-4 py-4">
                <TriangleAlert className="h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm leading-6 text-red-800">
                  Permohonan <span className="font-semibold">{namaAcara}</span> akan dihapus permanen
                  dan tidak bisa dikembalikan.
                </p>
              </div>

              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li>&bull; Seluruh data permohonan</li>
                <li>&bull; Riwayat status beserta catatan admin</li>
                {adaLampiran ? <li>&bull; Berkas lampiran yang tersimpan</li> : null}
              </ul>

              {error ? (
                <div className="mt-5 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <label className="mt-5 block text-sm font-medium text-ink" htmlFor="konfirmasi-hapus">
                Ketik <span className="font-semibold text-red-700">{KATA_KONFIRMASI}</span> untuk
                melanjutkan
              </label>
              <input
                autoComplete="off"
                className="input-field mt-2"
                id="konfirmasi-hapus"
                onChange={(event) => setKonfirmasi(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onHapus();
                }}
                placeholder={KATA_KONFIRMASI}
                value={konfirmasi}
              />

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button className="btn-secondary" disabled={loading} onClick={close} type="button">
                  Batal
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!siapHapus}
                  onClick={onHapus}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  {loading ? "Menghapus..." : "Ya, Hapus Permanen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
