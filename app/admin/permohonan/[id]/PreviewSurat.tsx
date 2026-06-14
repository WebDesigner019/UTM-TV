"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";

type Props = {
  id: number;
  fileOriginalName: string;
  fileMimeType: string;
};

export function PreviewSurat({ id, fileOriginalName, fileMimeType }: Props) {
  const [open, setOpen] = useState(false);

  const isPreviewable =
    fileMimeType === "application/pdf" || fileMimeType.startsWith("image/");

  if (!isPreviewable) {
    return (
      <span
        className="inline-flex cursor-not-allowed items-center gap-2 rounded border border-line px-4 py-2 font-semibold text-slate-400"
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
        className="inline-flex items-center gap-2 rounded border border-line px-4 py-2 font-semibold hover:bg-slate-50"
      >
        <Eye className="h-4 w-4" />
        Lihat Surat
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="truncate font-semibold">{fileOriginalName}</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={`/api/admin/permohonan/${id}/file/preview`}
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
