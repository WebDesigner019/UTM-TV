"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/**
 * Tombol pengalih mode terang/gelap.
 *
 * Class "dark" dipasang di <html> oleh skrip kecil di layout sebelum halaman
 * dicat, jadi tombol ini cukup membaca keadaan DOM saat mount. Karena server
 * tidak tahu tema pilihan pengguna, ikon baru disesuaikan setelah mounted agar
 * tidak memicu hydration mismatch.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage bisa diblokir, misalnya di mode privat. */
    }
  }

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/70 bg-white/80 text-ink transition-colors duration-200 hover:bg-gray-50 active:scale-[0.98] ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
