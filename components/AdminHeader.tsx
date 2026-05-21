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
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/admin" className="notranslate flex items-center gap-2 font-semibold" translate="no" suppressHydrationWarning>
          <Image src="/assets/utm-tv-logo.jpg" alt="Logo UTM TV" width={32} height={32} className="h-8 w-8 rounded object-cover" />
          <span suppressHydrationWarning>Admin UTM TV</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-600 sm:inline">{nama}</span>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 hover:bg-slate-50">
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
