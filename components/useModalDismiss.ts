"use client";

import { useEffect } from "react";

/**
 * Perilaku overlay modal: kunci scroll body selama terbuka dan tutup saat
 * Escape ditekan. Dipakai bersama oleh modal input manual dan modal ubah data
 * supaya tidak ada dua salinan efek yang bisa berbeda одна sama lain.
 */
export function useModalDismiss(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);
}
