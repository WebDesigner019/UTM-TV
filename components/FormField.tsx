import { UploadCloud } from "lucide-react";

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
  required = true
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[15px] font-semibold text-ink">{label}</label>
      <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-slate-50/60 px-4 py-8 text-center transition-all duration-200 hover:border-brand/50 hover:bg-brand/5">
        <UploadCloud className="h-8 w-8 text-slate-400 transition-colors duration-200 group-hover:text-brand" />
        <span className="text-sm font-semibold text-ink">Pilih berkas untuk diunggah</span>
        <input
          className="sr-only"
          name={name}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
          required={required}
        />
      </label>
      {hint ? <p className="mt-2 text-[13px] text-slate-500">{hint}</p> : null}
    </div>
  );
}