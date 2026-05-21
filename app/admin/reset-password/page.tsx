import Image from "next/image";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || "";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Image src="/assets/utm-tv-logo.jpg" alt="Logo UTM TV" width={64} height={64} className="mb-5 h-16 w-16 rounded object-cover" />
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Admin UTM TV</p>
      <h1 className="mt-2 text-3xl font-bold">Password Baru</h1>
      <p className="mb-6 mt-3 text-slate-600">Buat password admin baru untuk melanjutkan.</p>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="rounded border border-line bg-white p-5 text-sm text-slate-700">
          Tautan reset password tidak valid.
          <Link className="mt-4 block font-semibold text-brand hover:underline" href="/admin/forgot-password">
            Minta tautan baru
          </Link>
        </div>
      )}
    </main>
  );
}
