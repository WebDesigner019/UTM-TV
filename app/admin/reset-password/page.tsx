import Image from "next/image";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || "";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="card p-8">
        <Image src="/assets/utm-tv-logo.jpg" alt="Logo UTM TV" width={56} height={56} className="h-14 w-14 rounded-2xl object-cover shadow-card" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">Admin UTM TV</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Password Baru</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">Buat password admin baru untuk melanjutkan.</p>
        {token ? (
          <div className="mt-7">
            <ResetPasswordForm token={token} />
          </div>
        ) : (
          <div className="mt-7 rounded-xl border border-line/80 bg-white/70 p-5 text-sm text-slate-600">
            Tautan reset password tidak valid.
            <Link className="mt-4 block font-semibold text-brand transition-colors hover:text-brand-hover" href="/admin/forgot-password">
              Minta tautan baru
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}