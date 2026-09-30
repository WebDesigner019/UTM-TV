"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, X } from "lucide-react";
import { useModalDismiss } from "@/components/useModalDismiss";

type Props = {
  id: number;
  jenis: string;
  fileOriginalName: string;
  fileMimeType: string;
  file?: string;
};

export function PreviewSurat({ id, jenis, fileOriginalName, fileMimeType, file }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  useModalDismiss(open, close);

  useEffect(() => setMounted(true), []);

  const isPreviewable =
    fileMimeType === "application/pdf" || fileMimeType.startsWith("image/");

  if (!isPreviewable) {
    return (
      <span className="block">
        <span
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-slate-400"
        >
          <Eye className="h-4 w-4" />
          Lihat Surat
        </span>
        {/* Bukan title: di layar sentuh title tidak pernah terbaca, jadi
            keterangan ini ditulis sebagai teks yang selalu terlihat. */}
        <span className="mt-1.5 block text-sm text-slate-400 sm:text-[13px]">
          Pratinjau hanya tersedia untuk berkas PDF dan gambar.
        </span>
      </span>
    );
  }

  return (
    <>
      <button className="btn-secondary" onClick={() => setOpen(true)} type="button">
        <Eye className="h-4 w-4" />
        Lihat Surat
      </button>

      {open && mounted
        ? createPortal(
            <div
              aria-label={`Pratinjau ${fileOriginalName}`}
              aria-modal="true"
              className="modal-overlay"
              onClick={(event) => {
                if (event.target === event.currentTarget) close();
              }}
              role="dialog"
            >
              <div className="modal-panel max-w-5xl">
                <div className="modal-header">
                  <h3 className="min-w-0 flex-1 break-words font-semibold text-ink">
                    {fileOriginalName}
                  </h3>
                  <button aria-label="Tutup pratinjau" className="modal-close" onClick={close} type="button">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="modal-body p-0">
                  <iframe
                    className="h-full min-h-[60vh] w-full sm:min-h-0"
                    src={`/api/admin/permohonan/${id}/file/preview?jenis=${jenis}${file ? `&file=${file}` : ""}`}
                    title={fileOriginalName}
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
