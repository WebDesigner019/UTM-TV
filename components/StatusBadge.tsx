import { CheckCircle2, CircleSlash, Inbox, PartyPopper } from "lucide-react";
import type { StatusPermohonan } from "@prisma/client";
import { STATUS_LABEL } from "@/lib/status";

const STYLES: Record<StatusPermohonan, { icon: typeof Inbox; bg: string; text: string }> = {
  diterima: { icon: Inbox, bg: "bg-blue-50", text: "text-blue-700" },
  disetujui: { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-700" },
  ditolak: { icon: CircleSlash, bg: "bg-red-50", text: "text-red-700" },
  selesai: { icon: PartyPopper, bg: "bg-teal-50", text: "text-teal-700" }
};

export function StatusBadge({ status }: { status: StatusPermohonan }) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      <Icon className="h-3.5 w-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function StatusIcon({ status }: { status: StatusPermohonan }) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 ${style.text}`}>
      <Icon className="h-4 w-4" />
      {STATUS_LABEL[status]}
    </span>
  );
}
