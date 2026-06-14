import type { StatusPermohonan } from "@prisma/client";

export const STATUS_OPTIONS: StatusPermohonan[] = [
  "diterima",
  "disetujui",
  "ditolak",
  "selesai"
];

export const STATUS_LABEL: Record<StatusPermohonan, string> = {
  diterima: "Pengajuan masuk",
  disetujui: "Pengajuan disetujui",
  ditolak: "Ditolak",
  selesai: "Selesai"
};

export function formatTanggal(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export function formatTanggalWaktu(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}
