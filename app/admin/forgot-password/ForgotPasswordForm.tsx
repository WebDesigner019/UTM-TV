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
    <form onSubmit={onSubmit} className="space-y-4 rounded border border-line bg-white p-5">
      {message ? <div className="rounded border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</div> : null}
      {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div>
        <label className="mb-2 block text-sm font-medium">Email admin</label>
        <input className="focus-ring w-full rounded border border-line px-3 py-2" name="email" type="email" required />
      </div>
      <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand px-4 py-3 font-semibold text-white hover:bg-teal-800">
        <Mail className="h-4 w-4" />
        {loading ? "Mengirim..." : "Kirim Tautan Reset"}
      </button>
      <Link className="block text-center text-sm font-semibold text-brand hover:underline" href="/admin/login">
        Kembali ke login
      </Link>
    </form>
  );
}
