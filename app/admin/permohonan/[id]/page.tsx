import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, Eye } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { PreviewSurat } from "./PreviewSurat";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  JENIS_TITLE,
  STATUS_LABEL,
  formatTanggal,
  formatTanggalWaktu,
  type JenisPermohonan
} from "@/lib/status";
import { StatusBadge, StatusIcon } from "@/components/StatusBadge";
import { StatusForm } from "./StatusForm";

export const dynamic = "force-dynamic";

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
  const jenisLabel =
    JENIS_TITLE[jenis as JenisPermohonan] ??
    `Pengajuan ${jenis.charAt(0).toUpperCase()}${jenis.slice(1)}`;

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
  } else if (jenis === "peminjaman_podcast") {
    item = await prisma.permohonanPeminjamanPodcast.findUnique({
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

  // Data yang dicatat manual oleh admin tidak punya lampiran surat, sehingga
  // seluruh blok berkas disembunyikan bila kolomnya kosong.
  const fileUtama = item.filePath as string | null;
  const fileRekom = (item.fileRekomBakkPath ?? null) as string | null;
  const filePernyataan = (item.filePernyataanPath ?? null) as string | null;
  const adaLampiran =
    jenis === "peminjaman_podcast" ? Boolean(fileRekom || filePernyataan) : Boolean(fileUtama);

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
                    {item.nomorRujukan} · {jenisLabel}
                  </p>
                  {item.inputManuallyEntered ? (
                    <p className="mt-1.5 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Dicatat manual oleh admin
                    </p>
                  ) : null}
                  <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl">{item.namaAcara}</h1>
                </div>
                <StatusBadge status={item.status} />
              </div>

              {jenis === "liputan" ? (
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Info label="Instansi" value={item.namaInstansi} />
                  {item.email ? <Info label="Email" value={item.email} /> : null}
                  {item.noWa ? <Info label="No. WhatsApp" value={item.noWa} /> : null}
                  <Info label="Tanggal acara" value={formatTanggal(item.tanggalAcara)} />
                  <Info label="Tempat acara" value={item.tempatAcara} />
                  {item.detailPesertaAudiens ? <Info label="Detail Peserta/Audiens" value={item.detailPesertaAudiens} /> : null}
                  <Info label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                  {item.fileOriginalName ? <Info label="Nama file" value={item.fileOriginalName} /> : null}
                </dl>
              ) : jenis === "peminjaman_podcast" ? (
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Info label="Nama Organisasi/Instansi" value={item.namaInstansi} />
                  {item.email ? <Info label="Email" value={item.email} /> : null}
                  <Info label="Nama Acara/Tujuan Peminjaman" value={item.namaAcara} />
                  <Info label="Tanggal Peminjaman" value={formatTanggal(item.tanggalPeminjaman)} />
                  <Info label="Waktu" value={`${item.waktuMulai} - ${item.waktuSelesai}`} />
                  <Info label="Kontak Penanggung Jawab" value={item.kontakPenanggungJawab} />
                  {item.noteDetail ? <Info label="Note Detail" value={item.noteDetail} /> : null}
                  <Info label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                </dl>
              ) : (
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Info label="Fakultas/Organisasi/Unit" value={item.fakultasOrganisasi} />
                  {item.email ? <Info label="Email" value={item.email} /> : null}
                  <Info label="Nama Acara" value={item.namaAcara} />
                  <Info
                    label="Hari dan Tanggal Request Upload"
                    value={item.tanggalRequestUpload ? formatTanggal(item.tanggalRequestUpload) : "-"}
                  />
                  <Info label="Kontak Penanggung Jawab" value={item.kontakPenanggungJawab} />
                  <Info label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                  {item.fileOriginalName ? <Info label="Nama file" value={item.fileOriginalName} /> : null}
                </dl>
              )}

              {jenis === "peminjaman_podcast" && adaLampiran ? (
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {fileRekom ? (
                    <div className="rounded-2xl border border-line/70 p-5">
                      <p className="text-sm font-semibold text-ink">Surat Rekomendasi BAKK</p>
                      <p className="mt-0.5 truncate text-sm text-slate-400">{item.fileRekomBakkOriginalName}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <a className="btn-secondary" href={`${fileUrl}&file=rekom`}>
                          <Download className="h-4 w-4" />
                          Unduh
                        </a>
                        <PreviewSurat
                          id={item.id}
                          jenis={jenis}
                          file="rekom"
                          fileOriginalName={item.fileRekomBakkOriginalName}
                          fileMimeType={item.fileRekomBakkMimeType}
                        />
                      </div>
                    </div>
                  ) : null}
                  {filePernyataan ? (
                    <div className="rounded-2xl border border-line/70 p-5">
                      <p className="text-sm font-semibold text-ink">Surat Pernyataan</p>
                      <p className="mt-0.5 truncate text-sm text-slate-400">{item.filePernyataanOriginalName}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <a className="btn-secondary" href={`${fileUrl}&file=pernyataan`}>
                          <Download className="h-4 w-4" />
                          Unduh
                        </a>
                        <PreviewSurat
                          id={item.id}
                          jenis={jenis}
                          file="pernyataan"
                          fileOriginalName={item.filePernyataanOriginalName}
                          fileMimeType={item.filePernyataanMimeType}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : fileUtama ? (
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
              ) : (
                <p className="mt-7 rounded-2xl border border-dashed border-line bg-slate-50/60 px-4 py-5 text-sm text-slate-500">
                  Data ini dicatat manual oleh admin, jadi tidak ada lampiran surat.
                </p>
              )}
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

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value || "-"}</dd>
    </div>
  );
}