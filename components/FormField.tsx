"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, FileText, RotateCcw, UploadCloud, X } from "lucide-react";

const DEFAULT_ACCEPT =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

const TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOCX",
  jpg: "JPG",
  jpeg: "JPEG",
  png: "PNG"
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: value < 10 ? 1 : 0
  }).format(value);
  return `${formatted} ${units[unitIndex]}`;
}

function getExtension(name: string) {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : "";
}

function getTypeLabel(file: File) {
  const extension = getExtension(file.name);
  if (TYPE_LABEL[extension]) return TYPE_LABEL[extension];
  return file.type || "Berkas";
}

function matchesAccept(file: File, accept: string) {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const extension = getExtension(file.name);
  return rules.some((rule) => {
    if (rule.startsWith(".")) return extension === rule.slice(1);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}

function describeAccept(accept: string) {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  const extensions = rules
    .filter((rule) => rule.startsWith("."))
    .map((rule) => (TYPE_LABEL[rule.slice(1)] || rule.slice(1).toUpperCase()));
  if (extensions.length > 0) return extensions.join(", ");
  return rules.join(", ").toUpperCase();
}

export function TextareaField({
  label,
  name,
  placeholder,
  rows = 3,
  required = true,
  hint
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor={name}>
        {label}
      </label>
      <textarea
        className="focus-ring input-field"
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      {hint ? <p className="mt-1.5 text-[13px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  min,
  required = true,
  hint
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  min?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        className="focus-ring input-field"
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        min={min}
        required={required}
      />
      {hint ? <p className="mt-1.5 text-[13px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function FileInput({
  label,
  name,
  hint,
  required = true,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 5
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  maxSizeMb?: number;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectFile(candidate: File | undefined) {
    if (!candidate) return;

    if (candidate.size > maxSizeMb * 1024 * 1024) {
      resetInput();
      setFile(null);
      setError(`Ukuran berkas ${formatBytes(candidate.size)} melebihi batas ${maxSizeMb} MB.`);
      return;
    }

    if (!matchesAccept(candidate, accept)) {
      resetInput();
      setFile(null);
      setError(`Format berkas tidak didukung. Gunakan: ${describeAccept(accept)}.`);
      return;
    }

    if (inputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(candidate);
      inputRef.current.files = transfer.files;
    }
    setFile(candidate);
    setError("");
  }

  function clearFile() {
    resetInput();
    setFile(null);
    setError("");
  }

  const shellClassName = [
    "group rounded-xl border px-4 py-6 transition-all duration-200 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/25",
    dragging
      ? "border-dashed border-brand bg-brand/5"
      : file
        ? "border-line bg-white"
        : "border-dashed border-line bg-slate-50/60 hover:border-brand/50 hover:bg-brand/5"
  ].join(" ");

  return (
    <div>
      <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor={id}>
        {label}
      </label>
      <div
        className={shellClassName}
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          selectFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          accept={accept}
          className="sr-only"
          id={id}
          name={name}
          onChange={(event) => selectFile(event.target.files?.[0])}
          onInvalid={(event) => {
            event.preventDefault();
            setError(`${label} wajib diunggah.`);
          }}
          required={required}
          type="file"
        />

        {file ? (
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="h-full w-full object-cover" src={previewUrl} />
              ) : getExtension(file.name) === "pdf" ? (
                <span className="flex h-full w-full items-center justify-center bg-red-50 text-red-600">
                  <FileText className="h-6 w-6" />
                </span>
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-brand/10 text-brand">
                  <FileText className="h-6 w-6" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink" title={file.name}>
                {file.name}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {getTypeLabel(file)} &middot; {formatBytes(file.size)}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Siap diunggah
              </p>
            </div>

            <button
              aria-label={`Hapus berkas ${file.name}`}
              className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
              onClick={clearFile}
              title="Hapus berkas"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
            htmlFor={id}
          >
            <UploadCloud
              className={`h-8 w-8 transition-colors duration-200 ${dragging ? "text-brand" : "text-slate-400 group-hover:text-brand"}`}
            />
            <span className="text-sm font-semibold text-ink">Pilih berkas untuk diunggah</span>
            <span className="text-[13px] text-slate-500">atau tarik &amp; lepas berkas ke sini</span>
          </label>
        )}

        {file ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
            <button
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand transition-colors duration-200 hover:text-brand-hover"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Ganti berkas
            </button>
            <span className="text-[13px] text-slate-400">
              Maksimal {maxSizeMb} MB &middot; {describeAccept(accept)}
            </span>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-[13px] font-medium text-red-600">{error}</p> : null}
      {!error && hint ? <p className="mt-2 text-[13px] text-slate-500">{hint}</p> : null}
    </div>
  );
}
