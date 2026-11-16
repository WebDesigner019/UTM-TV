"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Eye, X } from "lucide-react";
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
  const isImage = fileMimeType.startsWith("image/");
  const query = `jenis=${jenis}${file ? `&file=${file}` : ""}`;
  const previewUrl = `/api/admin/permohonan/${id}/file/preview?${query}`;
  const downloadUrl = `/api/admin/permohonan/${id}/file?${query}`;

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
              <div className="modal-panel h-[calc(100dvh-1.5rem)] max-w-6xl sm:h-[85vh]">
                <div className="modal-header items-center">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold tracking-tight text-ink">Pratinjau Surat</h3>
                    <p className="mt-0.5 truncate text-sm text-slate-400" title={fileOriginalName}>
                      {fileOriginalName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      aria-label="Unduh surat"
                      className="btn-secondary px-3 py-2 sm:px-4"
                      href={downloadUrl}
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Unduh</span>
                    </a>
                    <button aria-label="Tutup pratinjau" className="modal-close" onClick={close} type="button">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="modal-body flex flex-1 items-center justify-center overflow-hidden bg-slate-100 p-0">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={fileOriginalName}
                      className="max-h-full max-w-full object-contain"
                      src={previewUrl}
                    />
                  ) : (
                    <iframe
                      className="h-full w-full border-0 bg-white"
                      src={previewUrl}
                      title={fileOriginalName}
                    />
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
