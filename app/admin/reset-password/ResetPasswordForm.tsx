"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirm_password") || "");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Password gagal diperbarui.");
      return;
    }
    setMessage(data.message);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded border border-line bg-white p-5">
      {message ? <div className="rounded border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</div> : null}
      {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div>
        <label className="mb-2 block text-sm font-medium">Password baru</label>
        <input className="focus-ring w-full rounded border border-line px-3 py-2" name="password" type="password" minLength={8} required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Konfirmasi password</label>
        <input className="focus-ring w-full rounded border border-line px-3 py-2" name="confirm_password" type="password" minLength={8} required />
      </div>
      <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand px-4 py-3 font-semibold text-white hover:bg-teal-800">
        <KeyRound className="h-4 w-4" />
        {loading ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
      {message ? (
        <Link className="block text-center text-sm font-semibold text-brand hover:underline" href="/admin/login">
          Masuk dengan password baru
        </Link>
      ) : null}
    </form>
  );
}
