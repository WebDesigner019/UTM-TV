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
      <label className="mb-2 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        className="focus-ring w-full rounded border border-line bg-white px-3 py-2"
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        min={min}
        required={required}
      />
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
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
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        className="focus-ring w-full rounded border border-line bg-white px-3 py-2 text-sm"
        name={name}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
        required={required}
      />
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}