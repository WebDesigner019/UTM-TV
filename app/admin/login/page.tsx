import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Image src="/assets/utm-tv-logo.jpg" alt="Logo UTM TV" width={64} height={64} className="mb-5 h-16 w-16 rounded object-cover" />
      <p className="text-sm font-semibold uppercase tracking-wide text-brand" suppressHydrationWarning>
        Admin UTM TV
      </p>
      <h1 className="mt-2 text-3xl font-bold">Login Admin</h1>
      <p className="mb-6 mt-3 text-slate-600">Masuk untuk mengelola permohonan liputan.</p>
      <LoginForm />
    </main>
  );
}
