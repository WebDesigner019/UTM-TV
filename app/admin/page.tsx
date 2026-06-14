import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { AdminHeader } from "@/components/AdminHeader";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, STATUS_OPTIONS, formatTanggal } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams: { status?: string; q?: string; page?: string };
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const status = searchParams.status;
  const q = searchParams.q?.trim();
  const page = Math.max(Number(searchParams.page || "1"), 1);
  const take = 15;
  const skip = (page - 1) * take;
  const where: Prisma.PermohonanWhereInput = {
    ...(status && STATUS_OPTIONS.includes(status as any) ? { status: status as any } : {}),
    ...(q
      ? {
          OR: [
            { nomorRujukan: { contains: q } },
            { namaInstansi: { contains: q } },
            { namaAcara: { contains: q } },
            { email: { contains: q.toLowerCase() } }
          ]
        }
      : {})
  };

  const [items, total, counts] = await Promise.all([
    prisma.permohonan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take
    }),
    prisma.permohonan.count({ where }),
    prisma.permohonan.groupBy({ by: ["status"], _count: { status: true } })
  ]);

  const countMap = Object.fromEntries(counts.map((item) => [item.status, item._count.status]));

  return (
    <>
      <AdminHeader nama={admin.nama} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Permohonan</h1>
            <p className="mt-2 text-slate-600">Kelola permohonan liputan yang masuk.</p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row">
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
              <div key={item.id} className="rounded border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-brand">{item.nomorRujukan}</div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-2 font-semibold">{item.namaAcara}</div>
                <div className="mt-1 text-sm text-slate-600">{item.namaInstansi}</div>
                <div className="mt-1 text-sm text-slate-500">{formatTanggal(item.tanggalAcara)}</div>
                <Link
                  className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
                  href={`/admin/permohonan/${item.id}`}
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
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.nomorRujukan}</td>
                    <td className="px-4 py-3">{item.namaAcara}</td>
                    <td className="px-4 py-3">{item.namaInstansi}</td>
                    <td className="px-4 py-3">{formatTanggal(item.tanggalAcara)}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">
                      <Link className="font-semibold text-brand hover:underline" href={`/admin/permohonan/${item.id}`}>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
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
