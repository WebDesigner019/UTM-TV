import Link from "next/link";
import Image from "next/image";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="notranslate flex items-center gap-2.5 font-semibold text-ink" translate="no" suppressHydrationWarning>
          <Image
            src="/assets/utm-tv-logo.jpg"
            alt="Logo UTM TV"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover shadow-sm"
            priority
          />
          <span suppressHydrationWarning>UTM TV</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="rounded-full px-4 py-2 font-medium text-ink transition-colors duration-200 hover:bg-gray-100" href="/lacak">
            Cek Status
          </Link>
          <Link
            className="rounded-full bg-brand px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-hover active:scale-[0.98]"
            href="/ajukan"
          >
            Ajukan
          </Link>
        </nav>
      </div>
    </header>
  );
}