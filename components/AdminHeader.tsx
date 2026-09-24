import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAdminCookie } from "@/lib/auth";

export function AdminHeader({ nama }: { nama: string }) {
  async function logout() {
    "use server";
    clearAdminCookie();
    redirect("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/admin" className="notranslate flex items-center gap-2.5 font-semibold" translate="no" suppressHydrationWarning>
          <Image src="/assets/utm-tv-logo.jpg" alt="Logo UTM TV" width={32} height={32} className="h-8 w-8 rounded-full object-cover shadow-sm" />
          <span suppressHydrationWarning>Admin UTM TV</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-500 sm:inline">{nama}</span>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 font-medium text-ink transition-all duration-200 hover:bg-gray-50 active:scale-[0.98]">
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}