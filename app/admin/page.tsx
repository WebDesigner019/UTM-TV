import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { TambahDataModal } from "./TambahDataModal";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  JENIS_OPTIONS as JENIS_VALUES,
  JENIS_TITLE,
  JENIS_TITLE_SHORT,
  STATUS_LABEL,
  STATUS_OPTIONS,
  formatTanggal
} from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import type { StatusPermohonan } from "@prisma/client";

export const dynamic = "force-dynamic";

const JENIS_OPTIONS = [
  { value: "semua", label: "Semua jenis" },
  ...JENIS_VALUES.map((value) => ({ value, label: JENIS_TITLE[value] }))
] as const;

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
  inputManuallyEntered: boolean;
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
  const includePeminjamanPodcast = jenis === "semua" || jenis === "peminjaman_podcast";

  const statusFilter = status && STATUS_OPTIONS.includes(status as any) ? { status: status as StatusPermohonan } : {};

  // Satu builder filter agar where untuk findMany dan count tidak pernah
  // berbeda satu-dua kolom.
  function buildWhere(fields: ("nomorRujukan" | "namaAcara" | "namaInstansi" | "fakultasOrganisasi" | "kontakPenanggungJawab" | "email")[]) {
    if (!q) return statusFilter;
    const lower = q.toLowerCase();
    return {
      ...statusFilter,
      OR: [
        ...fields.map((field) => ({ [field]: { contains: field === "email" ? lower : q } })),
        ...(fields.includes("email") ? [] : [{ email: { contains: lower } }])
      ]
    };
  }

  const whereLiputan = buildWhere(["nomorRujukan", "namaAcara", "namaInstansi"]);
  const whereMediaPartner = buildWhere(["nomorRujukan", "namaAcara", "fakultasOrganisasi", "kontakPenanggungJawab"]);
  const whereKerjasama = buildWhere(["nomorRujukan", "namaAcara", "fakultasOrganisasi", "kontakPenanggungJawab"]);
  const wherePeminjamanPodcast = buildWhere(["nomorRujukan", "namaAcara", "namaInstansi", "kontakPenanggungJawab"]);

  const [liputanItems, mpItems, kjItems, ppItems] = await Promise.all([
    includeLiputan
      ? prisma.permohonanLiputan.findMany({
          where: whereLiputan,
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
            createdAt: true,
            inputManuallyEntered: true
          }
        })
      : [],
    includeMediaPartner
      ? prisma.permohonanMediaPartner.findMany({
          where: whereMediaPartner,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: {
            id: true,
            nomorRujukan: true,
            fakultasOrganisasi: true,
            email: true,
            namaAcara: true,
            tanggalRequestUpload: true,
            status: true,
            createdAt: true,
            inputManuallyEntered: true
          }
        })
      : [],
    includeKerjasama
      ? prisma.permohonanKerjasama.findMany({
          where: whereKerjasama,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: {
            id: true,
            nomorRujukan: true,
            fakultasOrganisasi: true,
            email: true,
            namaAcara: true,
            tanggalRequestUpload: true,
            status: true,
            createdAt: true,
            inputManuallyEntered: true
          }
        })
      : [],
    includePeminjamanPodcast
      ? prisma.permohonanPeminjamanPodcast.findMany({
          where: wherePeminjamanPodcast,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: {
            id: true,
            nomorRujukan: true,
            namaInstansi: true,
            email: true,
            namaAcara: true,
            tanggalPeminjaman: true,
            status: true,
            createdAt: true,
            inputManuallyEntered: true
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
      createdAt: item.createdAt,
      inputManuallyEntered: item.inputManuallyEntered
    })),
    ...mpItems.map((item) => ({
      id: item.id,
      jenis: "media_partner",
      nomorRujukan: item.nomorRujukan,
      instansi: item.fakultasOrganisasi,
      email: item.email,
      namaAcara: item.namaAcara,
      tanggal: item.tanggalRequestUpload,
      status: item.status,
      createdAt: item.createdAt,
      inputManuallyEntered: item.inputManuallyEntered
    })),
    ...kjItems.map((item) => ({
      id: item.id,
      jenis: "kerjasama",
      nomorRujukan: item.nomorRujukan,
      instansi: item.fakultasOrganisasi,
      email: item.email,
      namaAcara: item.namaAcara,
      tanggal: item.tanggalRequestUpload,
      status: item.status,
      createdAt: item.createdAt,
      inputManuallyEntered: item.inputManuallyEntered
    })),
    ...ppItems.map((item) => ({
      id: item.id,
      jenis: "peminjaman_podcast",
      nomorRujukan: item.nomorRujukan,
      instansi: item.namaInstansi,
      email: item.email,
      namaAcara: item.namaAcara,
      tanggal: item.tanggalPeminjaman,
      status: item.status,
      createdAt: item.createdAt,
      inputManuallyEntered: item.inputManuallyEntered
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const [totalLiputan, totalMp, totalKj, totalPp] = await Promise.all([
    includeLiputan ? prisma.permohonanLiputan.count({ where: whereLiputan }) : 0,
    includeMediaPartner ? prisma.permohonanMediaPartner.count({ where: whereMediaPartner }) : 0,
    includeKerjasama ? prisma.permohonanKerjasama.count({ where: whereKerjasama }) : 0,
    includePeminjamanPodcast ? prisma.permohonanPeminjamanPodcast.count({ where: wherePeminjamanPodcast }) : 0
  ]);
  const total = totalLiputan + totalMp + totalKj + totalPp;

  const [liputanCounts, mpCounts, kjCounts, ppCounts] = await Promise.all([
    includeLiputan ? prisma.permohonanLiputan.groupBy({ by: ["status"], _count: { status: true } }) : [],
    includeMediaPartner ? prisma.permohonanMediaPartner.groupBy({ by: ["status"], _count: { status: true } }) : [],
    includeKerjasama ? prisma.permohonanKerjasama.groupBy({ by: ["status"], _count: { status: true } }) : [],
    includePeminjamanPodcast ? prisma.permohonanPeminjamanPodcast.groupBy({ by: ["status"], _count: { status: true } }) : []
  ]);

  const countMap: Record<string, number> = {};
  [...liputanCounts, ...mpCounts, ...kjCounts, ...ppCounts].forEach((c) => {
    countMap[c.status] = (countMap[c.status] || 0) + c._count.status;
  });

  return (
    <>
      <AdminHeader nama={admin.nama} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">Dashboard Permohonan</h1>
            <p className="mt-2 text-slate-500">
              Kelola permohonan liputan, media partner, kerjasama, dan peminjaman ruang podcast yang masuk.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <TambahDataModal
              filterAktif={Boolean(status) || jenis !== "semua" || Boolean(q)}
            />
            <form className="flex flex-col gap-2 sm:flex-row">
              <select className="input-field sm:w-auto" name="jenis" defaultValue={jenis}>
                {JENIS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select className="input-field sm:w-auto" name="status" defaultValue={status || ""}>
                <option value="">Semua status</option>
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABEL[item]}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input-field pl-10"
                  name="q"
                  defaultValue={q}
                  placeholder="Cari permohonan"
                />
              </div>
              <button className="btn-primary sm:w-auto">Filter</button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATUS_OPTIONS.map((item) => (
            <div key={item} className="card p-6">
              <div className="text-3xl font-bold tracking-tight text-ink">{countMap[item] || 0}</div>
              <div className="mt-2"><StatusBadge status={item} /></div>
            </div>
          ))}
        </div>

        {/* Mobile card layout */}
        <div className="mt-8 space-y-3 md:hidden">
          {items.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              Belum ada data permohonan.
            </div>
          ) : (
            items.map((item) => (
              <Link
                key={`${item.jenis}-${item.id}`}
                href={`/admin/permohonan/${item.id}?jenis=${item.jenis}`}
                className="card block p-5 transition-colors duration-150 hover:bg-white/90"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-brand">
                    {item.nomorRujukan}
                    {item.inputManuallyEntered ? (
                      <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Manual
                      </span>
                    ) : null}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-2 font-semibold text-ink">{item.namaAcara}</div>
                <div className="mt-1 text-sm text-slate-500">{item.instansi}</div>
                <div className="mt-1 text-sm text-slate-400">
                  {item.tanggal ? formatTanggal(item.tanggal) : "-"} · {JENIS_TITLE_SHORT[item.jenis as keyof typeof JENIS_TITLE_SHORT]}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="card mt-8 hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[15px]">
              <thead className="bg-slate-100/70 text-sm font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Nomor</th>
                  <th className="px-6 py-3.5">Acara</th>
                  <th className="px-6 py-3.5">Instansi</th>
                  <th className="px-6 py-3.5">Jenis</th>
                  <th className="px-6 py-3.5">Tanggal</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70 bg-white">
                {items.map((item) => (
                  <tr
                    key={`${item.jenis}-${item.id}`}
                    className="relative cursor-pointer transition-colors duration-150 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4 font-medium">
                      <Link
                        className="absolute inset-0"
                        href={`/admin/permohonan/${item.id}?jenis=${item.jenis}`}
                        aria-label={`Detail ${item.nomorRujukan}`}
                      />
                      {item.nomorRujukan}
                      {item.inputManuallyEntered ? (
                        <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Manual
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">{item.namaAcara}</td>
                    <td className="px-6 py-4">{item.instansi}</td>
                    <td className="px-6 py-4">{JENIS_TITLE_SHORT[item.jenis as keyof typeof JENIS_TITLE_SHORT]}</td>
                    <td className="px-6 py-4">{item.tanggal ? formatTanggal(item.tanggal) : "-"}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-slate-400" colSpan={6}>
                      Belum ada data permohonan.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>Total {total} permohonan</span>
          <span>
            Halaman {page} dari {Math.max(Math.ceil(total / take), 1)}
          </span>
        </div>
      </main>
    </>
  );
}