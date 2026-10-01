"use client";

import { useEffect } from "react";

/**
 * Halaman error untuk seluruh route segment.
 *
 * Tanpa file ini, error yang tidak tertangani di server membuat Next menampilkan
 * halaman error bawaan yang hanya menampilkan "Application error: a
 * server-side exception has occurred". Itu tidak memberi tahu pemohon
 * apa yang harus dilakukan, dan tidak ada jejak error ID yang bisa dicari
 * operator di log.
 *
 * Rincian error tidak pernah ditampilkan ke pengguna. Halaman ini hanya
 * menampilkan pesan generik dan kode acak yang sama persis dengan yang ditulis
 * ke log server, jadi laporan dari pemohon bisa dicocokkan tanpa membuka stack
 * trace atau isi database ke browser.
 */
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HALAMAN ERROR]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 sm:py-12">
      <div className="card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          COMPACT
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Ada Gangguan
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          Halaman ini gagal dimuat karena kesalahan di server. Data Anda tidak
          berubah. Coba muat ulang halaman, dan kalau tetap gagal laporkan kode
          di bawah ini ke admin COMPACT.
        </p>

        {error.digest ? (
          <p className="mt-6 rounded-xl border border-line/80 bg-white/70 p-4 text-sm text-slate-600">
            Kode laporan:{" "}
            <code className="font-mono text-ink">{error.digest}</code>
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Coba Lagi
          </button>
          <a href="/" className="btn-secondary">
            Ke Beranda
          </a>
        </div>
      </div>
    </main>
  );
}