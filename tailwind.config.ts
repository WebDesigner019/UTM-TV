import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f5f7",
        ink: "#1d1d1f",
        line: "#d2d2d7",
        brand: {
          DEFAULT: "#0071e3",
          hover: "#0077ed",
          active: "#005bbf"
        }
      },
      fontFamily: {
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