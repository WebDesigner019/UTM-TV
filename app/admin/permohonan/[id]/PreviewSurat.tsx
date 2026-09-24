"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";

type Props = {
  id: number;
  jenis: string;
  fileOriginalName: string;
  fileMimeType: string;
};

export function PreviewSurat({ id, jenis, fileOriginalName, fileMimeType }: Props) {
  const [open, setOpen] = useState(false);

  const isPreviewable =
    fileMimeType === "application/pdf" || fileMimeType.startsWith("image/");

  if (!isPreviewable) {
    return (
      <span
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-slate-400"
        title="Pratinjau tidak tersedia untuk file ini"
      >
        <Eye className="h-4 w-4" />
        Lihat Surat
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary"
      >
        <Eye className="h-4 w-4" />
        Lihat Surat
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line/70 px-6 py-4">
              <h3 className="truncate font-semibold text-ink">{fileOriginalName}</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 transition-colors duration-150 hover:bg-slate-100"
                aria-label="Tutup pratinjau"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={`/api/admin/permohonan/${id}/file/preview?jenis=${jenis}`}
                className="h-full w-full"
                title={fileOriginalName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}