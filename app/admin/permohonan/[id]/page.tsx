import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, Eye } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { PreviewSurat } from "./PreviewSurat";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, formatTanggal, formatTanggalWaktu } from "@/lib/status";
import { StatusBadge, StatusIcon } from "@/components/StatusBadge";
import { StatusForm } from "./StatusForm";

export const dynamic = "force-dynamic";

export default async function DetailPermohonanPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const id = Number(params.id);
  const item = await prisma.permohonan.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { admin: { select: { nama: true, email: true } } }
      }
    }
  });
  if (!item) notFound();

  return (
    <>
      <AdminHeader nama={admin.nama} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link className="text-sm font-semibold text-brand hover:underline" href="/admin">
          Kembali ke dashboard
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="rounded border border-line bg-white p-5">
              <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row">
                <div>
                  <p className="text-sm text-slate-500">{item.nomorRujukan}</p>
                  <h1 className="text-3xl font-bold">{item.namaAcara}</h1>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info label="Instansi" value={item.namaInstansi} />
                <Info label="Email" value={item.email} />
                <Info label="No. WhatsApp" value={item.noWa} />
                <Info label="Tanggal acara" value={formatTanggal(item.tanggalAcara)} />
                <Info label="Tempat acara" value={item.tempatAcara} />
                <Info label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                <Info label="Nama file" value={item.fileOriginalName} />
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded border border-line px-4 py-2 font-semibold hover:bg-slate-50"
                  href={`/api/admin/permohonan/${item.id}/file`}
                >
                  <Download className="h-4 w-4" />
                  Unduh Surat
                </a>
                <PreviewSurat
                  id={item.id}
                  fileOriginalName={item.fileOriginalName}
                  fileMimeType={item.fileMimeType}
                />
              </div>
            </div>

            <div className="rounded border border-line bg-white p-5">
              <h2 className="text-xl font-semibold">Riwayat status</h2>
              <div className="mt-4 space-y-4">
                {item.statusHistory.map((history) => (
                  <div key={history.id} className="border-l-2 border-brand pl-4">
                    <div className="font-medium"><StatusIcon status={history.statusBaru} /></div>
                    <div className="text-sm text-slate-500">
                      {formatTanggalWaktu(history.createdAt)}
                      {history.admin ? ` - ${history.admin.nama}` : " - Sistem"}
                    </div>
                    {history.pesan ? <p className="mt-1 text-sm text-slate-700">{history.pesan}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside>
            <StatusForm
              id={item.id}
              status={item.status}
              pesanPemohon={item.pesanPemohon}
              catatanInternal={item.catatanInternal}
            />
          </aside>
        </div>
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
