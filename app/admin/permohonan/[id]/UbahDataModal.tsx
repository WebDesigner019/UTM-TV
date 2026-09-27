"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PencilLine, X } from "lucide-react";
import {
  PermohonanForm,
  type PermohonanSubmitResult
} from "@/components/PermohonanForm";
import { useModalDismiss } from "@/components/useModalDismiss";
import { JENIS_TITLE, type JenisPermohonan } from "@/lib/status";

type Step = { name: "isi" } | { name: "selesai"; result: PermohonanSubmitResult };

/**
 * Modal ubah data. Memakai PermohonanForm variant "edit" supaya definisi
 * field, validasi, dan penanganan lampiran tidak diduplikasi dari form
 * publik maupun form input manual.
 *
 * Nilai form dikirim dari server lewat props, jadi modal ini tidak perlu
 * fetching data sendiri dan tidak bisa menampilkan data kadaluarsa.
 */
export function UbahDataModal({
  id,
  jenis,
  nomorRujukan,
  defaultValues,
  currentFiles,
  showKontak,
  tanpaNotifikasi
}: {
  id: number;
  jenis: JenisPermohonan;
  nomorRujukan: string;
  defaultValues: Record<string, string>;
  currentFiles: Record<string, string>;
  showKontak: boolean;
  tanpaNotifikasi: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ name: "isi" });

  const close = useCallback(() => {
    setOpen(false);
    setStep({ name: "isi" });
  }, []);

  useModalDismiss(open, close);

  function onSuccess(result: PermohonanSubmitResult) {
    setStep({ name: "selesai", result });
    router.refresh();
  }

  return (
    <>
      <button className="btn-secondary w-full" onClick={() => setOpen(true)} type="button">
        <PencilLine className="h-4 w-4" />
        Ubah Data
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
                <h2 className="text-xl font-bold tracking-tight text-ink">Ubah Data Permohonan</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {nomorRujukan} &middot; {JENIS_TITLE[jenis]}
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
              {step.name === "isi" ? (
                <PermohonanForm
                  className="space-y-5"
                  currentFiles={currentFiles}
                  defaultValues={defaultValues}
                  jenis={jenis}
                  onBack={close}
                  onSuccess={onSuccess}
                  recordId={id}
                  showKontak={showKontak}
                  tanpaNotifikasi={tanpaNotifikasi}
                  variant="edit"
                />
              ) : (
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
                    Perubahan tersimpan
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Nomor rujukan{" "}
                    <span className="font-semibold text-brand">{step.result.nomorRujukan}</span>
                  </p>

                  {step.result.perubahan && step.result.perubahan.length > 0 ? (
                    <div className="mx-auto mt-4 max-w-lg rounded-2xl border border-line bg-slate-50/70 p-4 text-left">
                      <p className="text-sm font-semibold text-ink">Field yang berubah</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {step.result.perubahan.map((item) => (
                          <li key={item}>&bull; {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-[13px] text-slate-400">
                      Tidak ada field yang berubah, jadi tidak ada notifikasi yang dikirim.
                    </p>
                  )}

                  {step.result.notifikasi ? (
                    <p className="mt-3 text-[13px] text-slate-400">
                      Notifikasi: {step.result.notifikasi}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button className="btn-primary" onClick={close} type="button">
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
