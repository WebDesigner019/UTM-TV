import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Pengajuan Liputan UTM TV",
  description: "Sistem web untuk mengajukan dan melacak permohonan liputan UTM TV.",
  icons: {
    icon: "/assets/utm-tv-logo.jpg",
    shortcut: "/assets/utm-tv-logo.jpg",
    apple: "/assets/utm-tv-logo.jpg"
  },
  other: {
    google: "notranslate"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" translate="no" className="notranslate" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
