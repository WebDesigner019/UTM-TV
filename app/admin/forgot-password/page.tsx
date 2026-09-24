import Image from "next/image";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="card p-8">
        <Image src="/assets/utm-tv-logo.jpg" alt="Logo UTM TV" width={56} height={56} className="h-14 w-14 rounded-2xl object-cover shadow-card" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">Admin UTM TV</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Lupa Password</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">Masukkan email admin untuk membuat password baru.</p>
        <div className="mt-7">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}