"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function PublicNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            alt="Logo UTM TV"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover shadow-sm"
            priority
          />
          <span suppressHydrationWarning>UTM TV</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            className="relative rounded-full px-4 py-2 font-medium text-ink transition-colors duration-200 after:absolute after:inset-x-4 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:bg-gray-100 hover:after:scale-x-100"
            href="/lacak"
          >
            Cek Status
          </Link>
          <Link
            className="rounded-full bg-brand px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-hover hover:shadow-elevated active:scale-[0.98]"
            href="/ajukan"
          >
            Ajukan
          </Link>
        </nav>
      </div>
    </header>
  );
}