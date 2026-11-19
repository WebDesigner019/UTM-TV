"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { jumpToAccordion, scrollToTarget } from "@/lib/smooth-scroll";

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

    // Beranda baru dirender saat navigasi dari halaman lain. Accordion perlu
    // waktu untuk menyiapkan handler lompat, jadi tunggu beberapa frame dulu
    // sebelum jatuh ke scroll statis.
    let frame = 0;
    let raf = 0;
    const tryJump = () => {
      if (jumpToAccordion(0)) return;
      if (frame < 30) {
        frame += 1;
        raf = requestAnimationFrame(tryJump);
        return;
      }
      const target = document.getElementById("pilih-jenis");
      if (target) scrollToTarget(target, false);
    };
    raf = requestAnimationFrame(tryJump);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  // Tombol "Ajukan" langsung membuka kartu pertama accordion (Pengajuan
  // Liputan), bukan hanya menggulir ke judul section-nya.
  const onAjukanClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/") return;
      event.preventDefault();
      window.history.replaceState(null, "", AJUKAN_TARGET);
      if (jumpToAccordion(0)) return;
      const target = document.getElementById("pilih-jenis");
      if (target) scrollToTarget(target);
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
          <ThemeToggle />
          <Link
            className="relative whitespace-nowrap rounded-full px-3 py-2.5 font-medium text-ink transition-colors duration-200 after:absolute after:inset-x-4 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:bg-gray-100 hover:after:scale-x-100 sm:px-4"
            href="/lacak"
          >
            Cek Status
          </Link>
          <Link
            className="whitespace-nowrap rounded-full bg-brand px-3 py-2.5 font-medium text-onbrand shadow-sm transition-all duration-200 hover:bg-brand-hover hover:shadow-elevated active:scale-[0.98] sm:px-4 sm:text-sm"
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