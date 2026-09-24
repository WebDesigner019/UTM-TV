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
    <form onSubmit={onSubmit} className="space-y-4">
      {message ? <div className="rounded-xl border border-teal-200/80 bg-teal-50/80 px-4 py-3 text-sm text-teal-800">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink">Password baru</label>
        <input className="focus-ring input-field" name="password" type="password" minLength={8} required />
      </div>
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink">Konfirmasi password</label>
        <input className="focus-ring input-field" name="confirm_password" type="password" minLength={8} required />
      </div>
      <button className="btn-primary w-full py-3">
        <KeyRound className="h-4 w-4" />
        {loading ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
      {message ? (
        <Link className="block text-center text-sm font-semibold text-brand transition-colors hover:text-brand-hover" href="/admin/login">
          Masuk dengan password baru
        </Link>
      ) : null}
    </form>
  );
}
