"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Permintaan gagal diproses.");
      return;
    }
    setMessage(data.message);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {message ? <div className="rounded-xl border border-teal-200/80 bg-teal-50/80 px-4 py-3 text-sm text-teal-800">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink">Email admin</label>
        <input className="focus-ring input-field" name="email" type="email" required />
      </div>
      <button className="btn-primary w-full py-3">
        <Mail className="h-4 w-4" />
        {loading ? "Mengirim..." : "Kirim Tautan Reset"}
      </button>
      <Link className="block text-center text-sm font-semibold text-brand transition-colors hover:text-brand-hover" href="/admin/login">
        Kembali ke login
      </Link>
    </form>
  );
}
