import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS } from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();
  const jenis = url.searchParams.get("jenis");
  const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
  const take = 15;
  const skip = (page - 1) * take;

  const statusFilter = status && STATUS_OPTIONS.includes(status as any) ? status : null;
  const qFilter = q
    ? { OR: [
        { nomorRujukan: { contains: q } },
        { namaAcara: { contains: q } }
      ] }
    : null;

  const qSearch = q || "";

  async function findLiputan() {
    const where: any = { ...(statusFilter ? { status: statusFilter } : {}) };
    if (qFilter) {
      where.OR = [
        ...qFilter.OR,
        { namaInstansi: { contains: qSearch } },
        { email: { contains: qSearch.toLowerCase() } }
      ];
    }
    const items = await prisma.permohonanLiputan.findMany({
      where,
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
    });
    const total = await prisma.permohonanLiputan.count({ where });
    const counts = await prisma.permohonanLiputan.groupBy({ by: ["status"], _count: { status: true } });
    return {
      items: items.map((item) => ({
        id: item.id,
        jenis: "liputan" as const,
        nomorRujukan: item.nomorRujukan,
        instansi: item.namaInstansi,
        email: item.email,
        namaAcara: item.namaAcara,
        tanggal: item.tanggalAcara,
        status: item.status,
        createdAt: item.createdAt
      })),
      total,
      counts: counts.map((c) => ({ status: c.status, count: c._count.status }))
    };
  }

  async function findMediaPartner() {
    const where: any = { ...(statusFilter ? { status: statusFilter } : {}) };
    if (qFilter) {
      where.OR = [
        ...qFilter.OR,
        { fakultasOrganisasi: { contains: qSearch } },
        { kontakPenanggungJawab: { contains: qSearch } }
      ];
    }
    const items = await prisma.permohonanMediaPartner.findMany({
      where,
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
    });
    const total = await prisma.permohonanMediaPartner.count({ where });
    const counts = await prisma.permohonanMediaPartner.groupBy({ by: ["status"], _count: { status: true } });
    return {
      items: items.map((item) => ({
        id: item.id,
        jenis: "media_partner" as const,
        nomorRujukan: item.nomorRujukan,
        instansi: item.fakultasOrganisasi,
        email: null,
        namaAcara: item.namaAcara,
        tanggal: item.tanggalRequestUpload,
        status: item.status,
        createdAt: item.createdAt
      })),
      total,
      counts: counts.map((c) => ({ status: c.status, count: c._count.status }))
    };
  }

  async function findKerjasama() {
    const where: any = { ...(statusFilter ? { status: statusFilter } : {}) };
    if (qFilter) {
      where.OR = [
        ...qFilter.OR,
        { fakultasOrganisasi: { contains: qSearch } },
        { kontakPenanggungJawab: { contains: qSearch } }
      ];
    }
    const items = await prisma.permohonanKerjasama.findMany({
      where,
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
    });
    const total = await prisma.permohonanKerjasama.count({ where });
    const counts = await prisma.permohonanKerjasama.groupBy({ by: ["status"], _count: { status: true } });
    return {
      items: items.map((item) => ({
        id: item.id,
        jenis: "kerjasama" as const,
        nomorRujukan: item.nomorRujukan,
        instansi: item.fakultasOrganisasi,
        email: null,
        namaAcara: item.namaAcara,
        tanggal: item.tanggalRequestUpload,
        status: item.status,
        createdAt: item.createdAt
      })),
      total,
      counts: counts.map((c) => ({ status: c.status, count: c._count.status }))
    };
  }

  const result: {
    items: any[];
    total: number;
    counts: { status: string; count: number }[];
  } = { items: [], total: 0, counts: [] };

  if (jenis === "liputan" || !jenis || jenis === "semua") {
    const liputan = await findLiputan();
    result.items.push(...liputan.items);
    result.total += liputan.total;
    result.counts.push(...liputan.counts);
  }
  if (jenis === "media_partner" || !jenis || jenis === "semua") {
    const mp = await findMediaPartner();
    result.items.push(...mp.items);
    result.total += mp.total;
    result.counts.push(...mp.counts);
  }
  if (jenis === "kerjasama" || !jenis || jenis === "semua") {
    const kj = await findKerjasama();
    result.items.push(...kj.items);
    result.total += kj.total;
    result.counts.push(...kj.counts);
  }

  result.items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const pages = Math.max(Math.ceil(result.total / take), 1);
  return NextResponse.json({ items: result.items, total: result.total, page, pages, counts: result.counts });
}