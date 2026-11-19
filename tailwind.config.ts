import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  // lib ikut dipindai karena lib/status.ts menyimpan class Tailwind untuk badge
  // kalender, chip filter, dan legenda. Tanpa baris ini kelas di file itu tidak
  // pernah dibuat, dan gejalanya badge jadi tidak punya warna sama sekali tanpa
  // ada error build. Class di sini ditulis utuh, bukan dirakit dari nama warna,
  // supaya bisa ditemukan pemindaian.
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Token semantik memakai CSS variable supaya otomatis berganti saat
        // <html> diberi class "dark". Nilainya didefinisikan di globals.css.
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        // `white` sengaja diarahkan ke permukaan kartu, bukan putih murni, agar
        // seluruh bg-white yang sudah ada ikut menjadi gelap. Teks di atas
        // tombol berwarna memakai `onbrand` yang selalu putih.
        white: "rgb(var(--surface) / <alpha-value>)",
        onbrand: "#ffffff",
        slate: {
          50: "rgb(var(--slate-50) / <alpha-value>)",
          100: "rgb(var(--slate-100) / <alpha-value>)",
          200: "rgb(var(--slate-200) / <alpha-value>)",
          300: "rgb(var(--slate-300) / <alpha-value>)",
          400: "rgb(var(--slate-400) / <alpha-value>)",
          500: "rgb(var(--slate-500) / <alpha-value>)",
          600: "rgb(var(--slate-600) / <alpha-value>)",
          700: "rgb(var(--slate-700) / <alpha-value>)",
          800: "rgb(var(--slate-800) / <alpha-value>)",
          900: "rgb(var(--slate-900) / <alpha-value>)"
        },
        gray: {
          50: "rgb(var(--gray-50) / <alpha-value>)",
          100: "rgb(var(--gray-100) / <alpha-value>)"
        },
        brand: {
          DEFAULT: "#0071e3",
          hover: "#0077ed",
          active: "#005bbf"
        }
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0, 0, 0, 0.05)",
        card: "0 4px 24px rgba(0, 0, 0, 0.07)",
        elevated: "0 12px 40px rgba(0, 0, 0, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;