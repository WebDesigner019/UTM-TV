import Link from "next/link";
import Image from "next/image";

export function PublicNav() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="notranslate flex items-center gap-2 font-semibold text-ink" translate="no" suppressHydrationWarning>
          <Image
            src="/assets/utm-tv-logo.jpg"
            alt="Logo UTM TV"
            width={32}
            height={32}
            className="h-8 w-8 rounded object-cover"
            priority
          />
          <span suppressHydrationWarning>UTM TV</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="rounded px-3 py-2 hover:bg-slate-100" href="/lacak">
            Cek Status
          </Link>
          <Link className="rounded bg-brand px-3 py-2 font-medium text-white hover:bg-teal-800" href="/ajukan">
            Ajukan
          </Link>
        </nav>
      </div>
    </header>
  );
}
