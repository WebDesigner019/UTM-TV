"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, BookOpen, X } from "lucide-react";
import { useModalDismiss } from "@/components/useModalDismiss";
import { LAYANAN, type Layanan } from "@/lib/layanan";

/**
 * Kartu peringatan di hero yang meminta pemohon membaca prosedur dan
 * ketentuan tiap layanan sebelum mengisi formulir, plus tombol yang membuka
 * modal uraian layanan.
 *
 * Isi uraiannya datang dari lib/layanan.ts supaya teksnya tinggal diubah di
 * satu tempat, bukan di dalam tombol yang masing-masing membawa salinannya.
 *
 * Modalnya dirender lewat portal ke body. Kartu ini memakai .card yang punya
 * backdrop-filter, dan elemen ber-backdrop-filter menjadi containing block
 * buat position fixed, jadi tanpa portal overlay-nya akan ikut terpotong kartu
 * dan section hero yang juga backdrop-blur.
 */
export function LayananProsedur() {
  const [aktif, setAktif] = useState<Layanan | null>(null);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setAktif(null), []);
  useModalDismiss(aktif !== null, close);

  useEffect(() => setMounted(true), []);

  return (
    <div data-hero className="card h-fit border-amber-300 bg-amber-50/70 p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-semibold text-ink">Baca dulu sebelum mengajukan</h2>
          <p className="mt-3 text-sm leading-6 text-amber-900/80">
            Sebelum mengajukan dan mengisi form, diharapkan untuk membaca dan memahami prosedur dan
            ketentuan tiap layanan COMPACT UTM TV.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {LAYANAN.map((layanan) => (
          <button
            className="btn-secondary justify-between px-4 py-3 text-left"
            key={layanan.jenis}
            onClick={() => setAktif(layanan)}
            type="button"
          >
            <span>{layanan.tombol}</span>
            <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        ))}
      </div>

      {aktif && mounted
        ? createPortal(<LayananModal layanan={aktif} onClose={close} />, document.body)
        : null}
    </div>
  );
}

function LayananModal({ layanan, onClose }: { layanan: Layanan; onClose: () => void }) {
  return (
    <div
      aria-label={layanan.judul}
      aria-modal="true"
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className="modal-panel">
        <div className="modal-header">
          <h2 className="text-base font-bold tracking-tight text-ink sm:text-xl">{layanan.judul}</h2>
          <button aria-label="Tutup" className="modal-close" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="modal-body space-y-6 sm:space-y-7">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
              A. Deskripsi Layanan
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-600">{layanan.deskripsi}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
              B. Prosedur Pengajuan
            </h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400">
              {layanan.prosedur.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
              C. Ketentuan Pengajuan
            </h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400">
              {layanan.ketentuan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        </div>

        <div className="modal-footer text-right">
          <button className="btn-primary w-full sm:w-auto" onClick={onClose} type="button">
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
