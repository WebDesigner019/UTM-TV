import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, STATUS_OPTIONS, formatTanggal } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import type { StatusPermohonan } from "@prisma/client";

export const dynamic = "force-dynamic";

const JENIS_OPTIONS = [
  { value: "semua", label: "Semua jenis" },
  { value: "liputan", label: "Pengajuan Liputan" },
  { value: "media_partner", label: "Pengajuan Media Partner" },
  { value: "kerjasama", label: "Pengajuan Kerjasama" }
] as const;

const JENIS_LABEL: Record<string, string> = {
  liputan: "Liputan",
  media_partner: "Media Partner",
  kerjasama: "Kerjasama"
};

type UnifiedItem = {
  id: number;
  jenis: string;
  nomorRujukan: string;
  instansi: string;
  email: string | null;
  namaAcara: string;
  tanggal: Date | null;
  status: StatusPermohonan;
  createdAt: Date;
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: { status?: string; q?: string; jenis?: string; page?: string };
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const status = searchParams.status;
  const q = searchParams.q?.trim();
  const jenis = searchParams.jenis || "semua";
  const page = Math.max(Number(searchParams.page || "1"), 1);
  const take = 15;
  const skip = (page - 1) * take;

  const includeLiputan = jenis === "semua" || jenis === "liputan";
  const includeMediaPartner = jenis === "semua" || jenis === "media_partner";
  const includeKerjasama = jenis === "semua" || jenis === "kerjasama";

  const statusFilter = status && STATUS_OPTIONS.includes(status as any) ? { status: status as StatusPermohonan } : {};

  const [liputanItems, mpItems, kjItems] = await Promise.all([
    includeLiputan
      ? prisma.permohonanLiputan.findMany({
          where: {
            ...statusFilter,
            ...(q
              ? {
                  OR: [
                    { nomorRujukan: { contains: q } },
                    { namaAcara: { contains: q } },
                    { namaInstansi: { contains: q } },
                    { email: { contains: q.toLowerCase() } }
                  ]
                }
              : {})
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: {
            id: true,
            nomorRujukan: true,
            namaInstansi: true,
            email: true,
            namaAcara: true,
            tanggalAcara: true,
            status: true,
            createdAt: true
          }
        })
      : [],
    includeMediaPartner
      ? prisma.permohonanMediaPartner.findMany({
          where: {
            ...statusFilter,
            ...(q
              ? {
                  OR: [
                    { nomorRujukan: { contains: q } },
                    { namaAcara: { contains: q } },
                    { fakultasOrganisasi: { contains: q } },
                    { kontakPenanggungJawab: { contains: q } }
                  ]
                }
              : {})
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: {
            id: true,
            nomorRujukan: true,
            fakultasOrganisasi: true,
            namaAcara: true,
            tanggalRequestUpload: true,
            status: true,
            createdAt: true
          }
        })
      : [],
    includeKerjasama
      ? prisma.permohonanKerjasama.findMany({
          where: {
            ...statusFilter,
            ...(q
              ? {
                  OR: [
                    { nomorRujukan: { contains: q } },
                    { namaAcara: { contains: q } },
                    { fakultasOrganisasi: { contains: q } },
                    { kontakPenanggungJawab: { contains: q } }
                  ]
                }
              : {})
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: {
            id: true,
            nomorRujukan: true,
            fakultasOrganisasi: true,
            namaAcara: true,
            tanggalRequestUpload: true,
            status: true,
            createdAt: true
          }
        })
      : []
  ]);

  const items: UnifiedItem[] = [
    ...liputanItems.map((item) => ({
      id: item.id,
      jenis: "liputan",
      nomorRujukan: item.nomorRujukan,
      instansi: item.namaInstansi,
      email: item.email,
      namaAcara: item.namaAcara,
      tanggal: item.tanggalAcara,
      status: item.status,
      createdAt: item.createdAt
    })),
    ...mpItems.map((item) => ({
      id: item.id,
      jenis: "media_partner",
      nomorRujukan: item.nomorRujukan,
      instansi: item.fakultasOrganisasi,
      email: null,
      namaAcara: item.namaAcara,
      tanggal: item.tanggalRequestUpload,
      status: item.status,
      createdAt: item.createdAt
    })),
    ...kjItems.map((item) => ({
      id: item.id,
      jenis: "kerjasama",
      nomorRujukan: item.nomorRujukan,
      instansi: item.fakultasOrganisasi,
      email: null,
      namaAcara: item.namaAcara,
      tanggal: item.tanggalRequestUpload,
      status: item.status,
      createdAt: item.createdAt
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const [totalLiputan, totalMp, totalKj] = await Promise.all([
    includeLiputan
      ? prisma.permohonanLiputan.count({
          where: {
            ...statusFilter,
            ...(q
              ? {
                  OR: [
                    { nomorRujukan: { contains: q } },
                    { namaAcara: { contains: q } },
                    { namaInstansi: { contains: q } },
                    { email: { contains: q.toLowerCase() } }
                  ]
                }
              : {})
          }
        })
      : 0,
    includeMediaPartner
      ? prisma.permohonanMediaPartner.count({
          where: {
            ...statusFilter,
            ...(q
              ? {
                  OR: [
                    { nomorRujukan: { contains: q } },
                    { namaAcara: { contains: q } },
                    { fakultasOrganisasi: { contains: q } },
                    { kontakPenanggungJawab: { contains: q } }
                  ]
                }
              : {})
          }
        })
      : 0,
    includeKerjasama
      ? prisma.permohonanKerjasama.count({
          where: {
            ...statusFilter,
            ...(q
              ? {
                  OR: [
                    { nomorRujukan: { contains: q } },
                    { namaAcara: { contains: q } },
                    { fakultasOrganisasi: { contains: q } },
                    { kontakPenanggungJawab: { contains: q } }
                  ]
                }
              : {})
          }
        })
      : 0
  ]);
  const total = totalLiputan + totalMp + totalKj;

  const [liputanCounts, mpCounts, kjCounts] = await Promise.all([
    includeLiputan ? prisma.permohonanLiputan.groupBy({ by: ["status"], _count: { status: true } }) : [],
    includeMediaPartner ? prisma.permohonanMediaPartner.groupBy({ by: ["status"], _count: { status: true } }) : [],
    includeKerjasama ? prisma.permohonanKerjasama.groupBy({ by: ["status"], _count: { status: true } }) : []
  ]);

  const countMap: Record<string, number> = {};
  [...liputanCounts, ...mpCounts, ...kjCounts].forEach((c) => {
    countMap[c.status] = (countMap[c.status] || 0) + c._count.status;
  });

  return (
    <>
      <AdminHeader nama={admin.nama} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Permohonan</h1>
            <p className="mt-2 text-slate-600">Kelola permohonan liputan, media partner, dan kerjasama yang masuk.</p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row">
            <select className="focus-ring rounded border border-line bg-white px-3 py-2" name="jenis" defaultValue={jenis}>
              {JENIS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select className="focus-ring rounded border border-line bg-white px-3 py-2" name="status" defaultValue={status || ""}>
              <option value="">Semua status</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABEL[item]}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="focus-ring w-full rounded border border-line bg-white py-2 pl-9 pr-3"
                name="q"
                defaultValue={q}
                placeholder="Cari permohonan"
              />
            </div>
            <button className="rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-teal-800">Filter</button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_OPTIONS.map((item) => (
            <div key={item} className="rounded border border-line bg-white p-4">
              <div className="text-2xl font-bold">{countMap[item] || 0}</div>
              <div className="mt-1"><StatusBadge status={item} /></div>
            </div>
          ))}
        </div>

        {/* Mobile card layout */}
        <div className="mt-6 space-y-3 md:hidden">
          {items.length === 0 ? (
            <div className="rounded border border-line bg-white p-6 text-center text-slate-500">
              Belum ada data permohonan.
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.jenis}-${item.id}`} className="rounded border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-brand">{item.nomorRujukan}</div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-2 font-semibold">{item.namaAcara}</div>
                <div className="mt-1 text-sm text-slate-600">{item.instansi}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {item.tanggal ? formatTanggal(item.tanggal) : "-"} · {JENIS_LABEL[item.jenis]}
                </div>
                <Link
                  className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
                  href={`/admin/permohonan/${item.id}?jenis=${item.jenis}`}
                >
                  Detail &rarr;
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="mt-6 hidden overflow-hidden rounded border border-line bg-white md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Nomor</th>
                  <th className="px-4 py-3">Acara</th>
                  <th className="px-4 py-3">Instansi</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr key={`${item.jenis}-${item.id}`}>
                    <td className="px-4 py-3 font-medium">{item.nomorRujukan}</td>
                    <td className="px-4 py-3">{item.namaAcara}</td>
                    <td className="px-4 py-3">{item.instansi}</td>
                    <td className="px-4 py-3">{JENIS_LABEL[item.jenis]}</td>
                    <td className="px-4 py-3">{item.tanggal ? formatTanggal(item.tanggal) : "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">
                      <Link className="font-semibold text-brand hover:underline" href={`/admin/permohonan/${item.id}?jenis=${item.jenis}`}>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      Belum ada data permohonan.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Total {total} permohonan</span>
          <span>
            Halaman {page} dari {Math.max(Math.ceil(total / take), 1)}
          </span>
        </div>
      </main>
    </>
  );
}