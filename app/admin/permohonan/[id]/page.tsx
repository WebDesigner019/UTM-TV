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

const JENIS_LABEL: Record<string, string> = {
  liputan: "Pengajuan Liputan",
  media_partner: "Pengajuan Media Partner",
  kerjasama: "Pengajuan Kerjasama"
};

export default async function DetailPermohonanPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { jenis?: string };
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const id = Number(params.id);
  const jenis = searchParams.jenis || "liputan";

  let item: any = null;
  if (jenis === "liputan") {
    item = await prisma.permohonanLiputan.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nama: true, email: true } } }
        }
      }
    });
  } else if (jenis === "media_partner") {
    item = await prisma.permohonanMediaPartner.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nama: true, email: true } } }
        }
      }
    });
  } else if (jenis === "kerjasama") {
    item = await prisma.permohonanKerjasama.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { nama: true, email: true } } }
        }
      }
    });
  }
  if (!item) notFound();

  const fileUrl = `/api/admin/permohonan/${item.id}/file?jenis=${jenis}`;

  return (
    <>
      <AdminHeader nama={admin.nama} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link className="text-sm font-semibold text-brand transition-colors hover:text-brand-hover" href="/admin">
          Kembali ke dashboard
        </Link>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-3 border-b border-line/70 pb-5 sm:flex-row">
                <div>
                  <p className="text-[13px] font-medium uppercase tracking-wide text-slate-400">
                    {item.nomorRujukan} · {JENIS_LABEL[jenis]}
                  </p>
                  <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl">{item.namaAcara}</h1>
                </div>
                <StatusBadge status={item.status} />
              </div>

              {jenis === "liputan" ? (
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Info label="Instansi" value={item.namaInstansi} />
                  <Info label="Email" value={item.email} />
                  <Info label="No. WhatsApp" value={item.noWa} />
                  <Info label="Tanggal acara" value={formatTanggal(item.tanggalAcara)} />
                  <Info label="Tempat acara" value={item.tempatAcara} />
                  {item.detailPesertaAudiens ? <Info label="Detail Peserta/Audiens" value={item.detailPesertaAudiens} /> : null}
                  <Info label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                  <Info label="Nama file" value={item.fileOriginalName} />
                </dl>
              ) : (
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Info label="Fakultas/Organisasi/Unit" value={item.fakultasOrganisasi} />
                  <Info label="Email" value={item.email} />
                  <Info label="Nama Acara" value={item.namaAcara} />
                  <Info
                    label="Hari dan Tanggal Request Upload"
                    value={item.tanggalRequestUpload ? formatTanggal(item.tanggalRequestUpload) : "-"}
                  />
                  <Info label="Kontak Penanggung Jawab" value={item.kontakPenanggungJawab} />
                  <Info label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                  <Info label="Nama file" value={item.fileOriginalName} />
                </dl>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  className="btn-secondary"
                  href={fileUrl}
                >
                  <Download className="h-4 w-4" />
                  Unduh Surat
                </a>
                <PreviewSurat
                  id={item.id}
                  jenis={jenis}
                  fileOriginalName={item.fileOriginalName}
                  fileMimeType={item.fileMimeType}
                />
              </div>
            </div>

            <div className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold tracking-tight text-ink">Riwayat status</h2>
              <div className="mt-5">
                {item.statusHistory.map((history: any, index: number) => (
                  <div key={history.id} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="h-3 w-3 shrink-0 rounded-full bg-brand ring-4 ring-brand/15" />
                      {index < item.statusHistory.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-ink"><StatusIcon status={history.statusBaru} /></div>
                      <div className="mt-0.5 text-sm text-slate-400">
                        {formatTanggalWaktu(history.createdAt)}
                        {history.admin ? ` - ${history.admin.nama}` : " - Sistem"}
                      </div>
                      {history.pesan ? <p className="mt-1.5 text-sm leading-6 text-slate-600">{history.pesan}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside>
            <StatusForm
              id={item.id}
              jenis={jenis}
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
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}