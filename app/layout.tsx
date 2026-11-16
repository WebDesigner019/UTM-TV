import type { Metadata } from "next";
import { getAppUrl, getGoogleSiteVerification } from "@/lib/env";
import "./globals.css";

const googleSiteVerification = getGoogleSiteVerification();

// Dipasang sebelum body dirender supaya tema tersimpan langsung aktif dan
// halaman tidak sempat berkedip terang saat mode gelap dipilih.
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "COMPACT - UTM TV Service System",
  description: "COMPACT - Cooperation, Media Partnership, Administration, Collaboration, & Tracking.",
  icons: {
    icon: "/assets/utm-tv-logo.jpg",
    shortcut: "/assets/utm-tv-logo.jpg",
    apple: "/assets/utm-tv-logo.jpg"
  },
  // Diisi lewat GOOGLE_SITE_VERIFICATION. Kosong = tidak dirender.
  ...(googleSiteVerification ? { verification: { google: googleSiteVerification } } : {}),
  other: {
    google: "notranslate"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" translate="no" className="notranslate" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
