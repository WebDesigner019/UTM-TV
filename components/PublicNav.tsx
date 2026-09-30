"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const AJUKAN_TARGET = "/#pilih-jenis";

export function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    if (window.location.hash !== "#pilih-jenis") return;

    // Beranda baru dirender saat navigasi dari halaman lain, jadi targetnya
    // dicari setelah frame supaya elemen section sudah ada di DOM.
    const raf = requestAnimationFrame(() => {
      document.getElementById("pilih-jenis")?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  /**
   * Tombol "Ajukan" membawa pengguna ke beranda lalu ke section "Pilih Jenis
   * Pengajuan". Kalau sedang sudah di beranda, scroll dilakukan manual supaya
   * elemen dengan animasi reveal sudah ikut ter-scroll trigger.
   */
  const onAjukanClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/") return;

      const target = document.getElementById("pilih-jenis");
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", AJUKAN_TARGET);
    },
    [pathname]
  );

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-all duration-300 ${
        scrolled
          ? "border-line/70 bg-white/95 shadow-card"
          : "border-transparent bg-white/60"
      } backdrop-blur-xl`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="notranslate flex items-center gap-2.5 font-semibold text-ink" translate="no" suppressHydrationWarning>
          <Image
            src="/assets/utm-tv-logo.jpg"
            alt="Logo COMPACT"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover shadow-sm"
            priority
          />
          <span suppressHydrationWarning>COMPACT UTM TV</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
          <Link
            className="relative whitespace-nowrap rounded-full px-3 py-2.5 font-medium text-ink transition-colors duration-200 after:absolute after:inset-x-4 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:bg-gray-100 hover:after:scale-x-100 sm:px-4"
            href="/lacak"
          >
            Cek Status
          </Link>
          <Link
            className="whitespace-nowrap rounded-full bg-brand px-3 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-hover hover:shadow-elevated active:scale-[0.98] sm:px-4 sm:text-sm"
            href={AJUKAN_TARGET}
            onClick={onAjukanClick}
          >
            Ajukan
          </Link>
        </nav>
      </div>
    </header>
  );
}