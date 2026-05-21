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
    <form onSubmit={onSubmit} className="space-y-4 rounded border border-line bg-white p-5">
      {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div>
        <label className="mb-2 block text-sm font-medium">Email admin</label>
        <input className="focus-ring w-full rounded border border-line px-3 py-2" name="email" type="email" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>
        <input className="focus-ring w-full rounded border border-line px-3 py-2" name="password" type="password" required />
      </div>
      <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand px-4 py-3 font-semibold text-white hover:bg-teal-800">
        <LogIn className="h-4 w-4" />
        {loading ? "Masuk..." : "Masuk"}
      </button>
      <Link className="block text-center text-sm font-semibold text-brand hover:underline" href="/admin/forgot-password">
        Lupa password?
      </Link>
    </form>
  );
}
