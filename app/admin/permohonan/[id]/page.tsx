import Link from "next/link";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock,
  Download,
  FileText,
  History,
  Mail,
  MapPin,
  Phone,
  Users,
  type LucideIcon
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { PreviewSurat } from "./PreviewSurat";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isJenisPermohonan } from "@/lib/permohonan-schema";
import { findPermohonan } from "@/lib/permohonan-record";
import { getCurrentFileNames, getFormValuesFromRecord } from "@/lib/permohonan-edit";
import {
  JENIS_TITLE,
  JENIS_TITLE_SHORT,
  formatTanggal,
  formatTanggalWaktu,
  type JenisPermohonan
} from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusForm } from "./StatusForm";
import { UbahDataModal } from "./UbahDataModal";
import { HapusDataModal } from "./HapusDataModal";

export const dynamic = "force-dynamic";

/** Riwayat ikut diambil untuk timeline di halaman ini. */
const includeRiwayat = {
  statusHistory: {
    orderBy: { createdAt: "asc" },
    include: { admin: { select: { nama: true, email: true } } }
  }
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
  const jenisParam = searchParams.jenis || "liputan";
  const jenisLabel = isJenisPermohonan(jenisParam)
    ? JENIS_TITLE[jenisParam]
    : `Pengajuan ${jenisParam.charAt(0).toUpperCase()}${jenisParam.slice(1)}`;

  // Jenis yang tidak dikenal tidak bisa di-read dari database mana pun, jadi
  // halaman ini langsung 404 daripada menampilkan record jenis lain.
  const item: any = isJenisPermohonan(jenisParam)
    ? await findPermohonan(jenisParam, id, { include: includeRiwayat })
    : null;
  if (!item) notFound();

  const jenis = jenisParam as JenisPermohonan;
  const fileUrl = `/api/admin/permohonan/${item.id}/file?jenis=${jenis}`;

  // Data yang dicatat manual oleh admin tidak punya kontak pemohon dan tidak
  // pernah memicu notifikasi, jadi form ubah data juga tidak membuka kolom
  // kontak untuk record seperti ini.
  const manual = Boolean(item.inputManuallyEntered);
  const defaultValues = getFormValuesFromRecord(jenis, item, !manual);
  const currentFiles = getCurrentFileNames(jenis, item);

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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
          <Link
            className="inline-flex items-center gap-1.5 font-semibold text-brand transition-colors hover:text-brand-hover"
            href="/admin"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate">{jenisLabel}</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-600">{item.nomorRujukan}</span>
        </nav>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="order-1 space-y-6">
            <div className="card overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-brand via-sky-500 to-orange-500" />
              <div className="p-5 sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                        {JENIS_TITLE_SHORT[jenis]}
                      </span>
                      {item.inputManuallyEntered ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Dicatat manual
                        </span>
                      ) : null}
                    </div>
                    <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                      {item.namaAcara}
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-500">
                      Nomor rujukan <span className="font-semibold text-ink">{item.nomorRujukan}</span>
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-6 border-t border-line/70 pt-5">

                  {jenis === "liputan" ? (
                    <dl className="grid gap-2.5 sm:grid-cols-2">
                      <Info icon={Building2} label="Instansi" value={item.namaInstansi} />
                      {item.email ? <Info icon={Mail} label="Email" value={item.email} /> : null}
                      {item.noWa ? <Info icon={Phone} label="No. WhatsApp" value={item.noWa} /> : null}
                      <Info icon={CalendarDays} label="Tanggal acara" value={formatTanggal(item.tanggalAcara)} />
                      {item.waktuAcara ? <Info icon={Clock} label="Waktu acara" value={item.waktuAcara} /> : null}
                      <Info icon={MapPin} label="Tempat acara" value={item.tempatAcara} />
                      {item.detailPesertaAudiens ? (
                        <Info icon={Users} label="Detail Peserta/Audiens" value={item.detailPesertaAudiens} />
                      ) : null}
                      <Info icon={History} label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                    </dl>
                  ) : jenis === "peminjaman_podcast" ? (
                    <dl className="grid gap-2.5 sm:grid-cols-2">
                      <Info icon={Building2} label="Nama Organisasi/Instansi" value={item.namaInstansi} />
                      {item.email ? <Info icon={Mail} label="Email" value={item.email} /> : null}
                      <Info icon={ClipboardList} label="Nama Acara/Tujuan Peminjaman" value={item.namaAcara} />
                      <Info
                        icon={CalendarDays}
                        label="Tanggal Peminjaman"
                        value={formatTanggal(item.tanggalPeminjaman)}
                      />
                      <Info icon={Clock} label="Waktu" value={`${item.waktuMulai} - ${item.waktuSelesai}`} />
                      {item.kontakPenanggungJawab ? (
                        <Info icon={Phone} label="Kontak Penanggung Jawab" value={item.kontakPenanggungJawab} />
                      ) : null}
                      {item.noteDetail ? (
                        <Info icon={FileText} label="Note Detail" value={item.noteDetail} />
                      ) : null}
                      <Info icon={History} label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                    </dl>
                  ) : (
                    <dl className="grid gap-2.5 sm:grid-cols-2">
                      <Info icon={Building2} label="Fakultas/Organisasi/Unit" value={item.fakultasOrganisasi} />
                      {item.email ? <Info icon={Mail} label="Email" value={item.email} /> : null}
                      <Info icon={ClipboardList} label="Nama Acara" value={item.namaAcara} />
                      <Info
                        icon={CalendarDays}
                        label="Hari dan Tanggal Request Upload"
                        value={item.tanggalRequestUpload ? formatTanggal(item.tanggalRequestUpload) : "-"}
                      />
                      {item.kontakPenanggungJawab ? (
                        <Info icon={Phone} label="Kontak Penanggung Jawab" value={item.kontakPenanggungJawab} />
                      ) : null}
                      <Info icon={History} label="Diajukan" value={formatTanggalWaktu(item.createdAt)} />
                    </dl>
                  )}
                </div>

                {jenis === "peminjaman_podcast" && adaLampiran ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {fileRekom ? (
                      <FileCard
                        downloadHref={`${fileUrl}&file=rekom`}
                        fileName={item.fileRekomBakkOriginalName}
                        label="Surat Rekomendasi BAKK"
                        preview={
                          <PreviewSurat
                            id={item.id}
                            jenis={jenis}
                            file="rekom"
                            fileOriginalName={item.fileRekomBakkOriginalName}
                            fileMimeType={item.fileRekomBakkMimeType}
                          />
                        }
                      />
                    ) : null}
                    {filePernyataan ? (
                      <FileCard
                        downloadHref={`${fileUrl}&file=pernyataan`}
                        fileName={item.filePernyataanOriginalName}
                        label="Surat Pernyataan"
                        preview={
                          <PreviewSurat
                            id={item.id}
                            jenis={jenis}
                            file="pernyataan"
                            fileOriginalName={item.filePernyataanOriginalName}
                            fileMimeType={item.filePernyataanMimeType}
                          />
                        }
                      />
                    ) : null}
                  </div>
                ) : fileUtama ? (
                  <div className="mt-5">
                    <FileCard
                      downloadHref={fileUrl}
                      fileName={item.fileOriginalName}
                      label="Surat Permohonan"
                      preview={
                        <PreviewSurat
                          id={item.id}
                          jenis={jenis}
                          fileOriginalName={item.fileOriginalName}
                          fileMimeType={item.fileMimeType}
                        />
                      }
                    />
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl border border-dashed border-line bg-slate-50/60 px-4 py-5 text-sm text-slate-500">
                    Belum ada lampiran surat. Admin bisa menambahkannya lewat &quot;Ubah Data&quot;.
                  </p>
                )}
              </div>
            </div>
            <div className="card p-5 sm:p-8">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">Riwayat status</h2>
              </div>
              <ol className="mt-6">
                {item.statusHistory.map((history: any, index: number) => (
                  <li key={history.id} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-brand ring-4 ring-brand/15" />
                      {index < item.statusHistory.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <StatusBadge status={history.statusBaru} />
                      <div className="mt-1.5 text-sm text-slate-400">
                        {formatTanggalWaktu(history.createdAt)}
                        {history.admin ? ` - ${history.admin.nama}` : " - Sistem"}
                      </div>
                      {history.pesan ? (
                        <p className="mt-2 break-words rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                          {history.pesan}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <aside className="order-2 lg:sticky lg:top-20 lg:self-start">
            <div className="space-y-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
              <div className="card p-4 sm:p-5">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-400">Tindakan</h2>
                <div className="mt-3 space-y-2.5">
                  <UbahDataModal
                    currentFiles={currentFiles}
                    defaultValues={defaultValues}
                    id={item.id}
                    jenis={jenis}
                    nomorRujukan={item.nomorRujukan}
                    showKontak={!manual}
                    tanpaNotifikasi={manual}
                  />
                  <HapusDataModal
                    adaLampiran={adaLampiran}
                    id={item.id}
                    jenis={jenis}
                    namaAcara={item.namaAcara}
                    nomorRujukan={item.nomorRujukan}
                  />
                </div>
              </div>
              <StatusForm
                id={item.id}
                jenis={jenis}
                status={item.status}
                pesanPemohon={item.pesanPemohon}
                catatanInternal={item.catatanInternal}
              />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Info({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-line/60 bg-white/60 p-3.5">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[13px] leading-5 text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words font-medium leading-6 text-ink">{value || "-"}</dd>
      </div>
    </div>
  );
}

function FileCard({
  label,
  fileName,
  downloadHref,
  preview
}: {
  label: string;
  fileName?: string | null;
  downloadHref: string;
  preview: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line/70 bg-slate-50/50 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-line/70">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="mt-0.5 break-all text-sm text-slate-400">{fileName || "-"}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a className="btn-secondary" href={downloadHref}>
          <Download className="h-4 w-4" />
          Unduh
        </a>
        {preview}
      </div>
    </div>
  );
}