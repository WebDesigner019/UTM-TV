import Image from "next/image";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Image src="/assets/utm-tv-logo.jpg" alt="Logo UTM TV" width={64} height={64} className="mb-5 h-16 w-16 rounded object-cover" />
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Admin UTM TV</p>
      <h1 className="mt-2 text-3xl font-bold">Lupa Password</h1>
      <p className="mb-6 mt-3 text-slate-600">Masukkan email admin untuk membuat password baru.</p>
      <ForgotPasswordForm />
    </main>
  );
}
