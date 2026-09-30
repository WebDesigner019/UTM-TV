"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Login gagal.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor="login-email">
          Email admin
        </label>
        <input
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          className="focus-ring input-field"
          id="login-email"
          inputMode="email"
          name="email"
          spellCheck={false}
          type="email"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink" htmlFor="login-password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="focus-ring input-field"
          id="login-password"
          name="password"
          type="password"
          required
        />
      </div>
      <button className="btn-primary w-full py-3" disabled={loading} type="submit">
        <LogIn className="h-4 w-4" />
        {loading ? "Masuk..." : "Masuk"}
      </button>
      <Link className="block py-2 text-center text-sm font-semibold text-brand transition-colors hover:text-brand-hover" href="/admin/forgot-password">
        Lupa password?
      </Link>
    </form>
  );
}
