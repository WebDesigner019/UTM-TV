"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Megaphone, Plus, Radio, Users, X } from "lucide-react";
import {
  PermohonanForm,
  type PermohonanSubmitResult
} from "@/components/PermohonanForm";
import {
  JENIS_DESCRIPTION,
  JENIS_OPTIONS,
  JENIS_TITLE_SHORT,
  type JenisPermohonan
} from "@/lib/status";

const ICONS: Record<JenisPermohonan, typeof Radio> = {
  liputan: Radio,
  media_partner: Megaphone,
  kerjasama: Users,
  peminjaman_podcast: Megaphone
};

type Step =
  | { name: "pilih" }
  | { name: "isi"; jenis: JenisPermohonan }
  | { name: "selesai"; result: PermohonanSubmitResult };

export function TambahDataModal({ filterAktif }: { filterAktif: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ name: "pilih" });

  const close = useCallback(() => {
    setOpen(false);
    setStep({ name: "pilih" });
  }, []);

  // Kunci scroll body dan tutup dengan Escape selama modal terbuka.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  function onSuccess(result: PermohonanSubmitResult) {
    setStep({ name: "selesai", result });
    router.refresh();
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)} type="button">
        <Plus className="h-4 w-4" />
        Tambah Data
      </button>

      {open ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          role="dialog"
        >
          <div className="card my-auto w-full max-w-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-line/70 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">Tambah Data Permohonan</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Catat pengajuan yang diterima di luar formulir publik.
                </p>
              </div>
              <button
                aria-label="Tutup"
                className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
                onClick={close}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              {step.name === "pilih" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {JENIS_OPTIONS.map((jenis) => {
                    const Icon = ICONS[jenis];
                    return (
                      <button
                        className="flex items-start gap-4 rounded-2xl border border-line bg-white/70 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-white hover:shadow-md"
                        key={jenis}
                        onClick={() => setStep({ name: "isi", jenis })}
                        type="button"
                      >
                        <span className="tile-icon shrink-0">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink">{JENIS_TITLE_SHORT[jenis]}</span>
                          <span className="mt-1 block text-[13px] leading-5 text-slate-500">
                            {JENIS_DESCRIPTION[jenis]}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step.name === "isi" ? (
                <PermohonanForm
                  className="space-y-5"
                  jenis={step.jenis}
                  onBack={() => setStep({ name: "pilih" })}
                  onSuccess={onSuccess}
                  showStatusAwal
                  variant="admin"
                />
              ) : null}

              {step.name === "selesai" ? (
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">Data tersimpan</h3>
                  <p className="mt-2 text-slate-500">
                    Nomor rujukan{" "}
                    <span className="font-semibold text-brand">{step.result.nomorRujukan}</span>
                  </p>
                  <p className="mt-1 text-[13px] text-slate-400">
                    Email, nomor WhatsApp, dan lampiran surat tidak dikumpulkan, jadi tidak ada
                    notifikasi yang dikirim.
                  </p>

                  {filterAktif ? (
                    <p className="mx-auto mt-4 max-w-md rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-[13px] leading-5 text-amber-900">
                      Filter atau pencarian sedang aktif, jadi data ini mungkin tidak terlihat di
                      daftar. Klik &quot;Filter&quot; dengan kosongkan kolom untuk melihat semua data.
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      className="btn-secondary"
                      href={`/admin/permohonan/${step.result.id}?jenis=${step.result.jenis}`}
                      onClick={close}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Lihat detail
                    </Link>
                    <button
                      className="btn-secondary"
                      onClick={() => setStep({ name: "isi", jenis: step.result.jenis })}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah lagi
                    </button>
                    <button className="btn-primary" onClick={close} type="button">
                      Selesai
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
