import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS } from "@/lib/status";
import { isJenisPermohonan } from "@/lib/permohonan-schema";
import { findPermohonan, getPermohonanDelegate, getRiwayatDelegate } from "@/lib/permohonan-record";
import { kirimNotifikasiStatus, kirimNotifikasiPerubahan } from "@/lib/permohonan-notify";
import { PermohonanEditError, updatePermohonanData } from "@/lib/permohonan-edit";
import { PermohonanHapusError, hapusPermohonan } from "@/lib/permohonan-delete";

export const dynamic = "force-dynamic";

/** Riwayat ikut diambil apa adanya untuk halaman detail. */
const includeRiwayat = {
  statusHistory: {
    orderBy: { createdAt: "asc" },
    include: { admin: { select: { nama: true, email: true } } }
  }
};

const updateSchema = z.object({
  status: z.enum(["diterima", "disetujui", "ditolak", "selesai"]),
  pesan_pemohon: z.string().optional().nullable(),
  catatan_internal: z.string().optional().nullable()
});

/** Jenis dibaca dari query param dan divalidasi, bukan dipercaya mentah. */
function resolveJenis(request: Request) {
  const jenis = new URL(request.url).searchParams.get("jenis") || "liputan";
  return isJenisPermohonan(jenis) ? jenis : null;
}

function resolveId(params: { id: string }) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const jenis = resolveJenis(request);
  if (!jenis) return NextResponse.json({ message: "Jenis permohonan tidak valid." }, { status: 400 });

  const id = resolveId(params);
  if (!id) return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });

  const permohonan = await findPermohonan(jenis, id, { include: includeRiwayat });
  if (!permohonan) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });

  return NextResponse.json({ permohonan, jenis });
}

/**
 * Ubah status, pesan pemohon, dan catatan internal. Field data lainnya tidak
 * tersentuh di sini; perubahan data lewat PUT.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const jenis = resolveJenis(request);
  if (!jenis) return NextResponse.json({ message: "Jenis permohonan tidak valid." }, { status: 400 });

  const id = resolveId(params);
  if (!id) return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });

  try {
    const body = updateSchema.parse(await request.json());
    if (!STATUS_OPTIONS.includes(body.status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    const existing = await getPermohonanDelegate(jenis).findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });

    const updated = await prisma.$transaction(async (tx) => {
      const item = await getPermohonanDelegate(jenis, tx).update({
        where: { id },
        data: {
          status: body.status,
          pesanPemohon: body.pesan_pemohon || null,
          catatanInternal: body.catatan_internal || null
        }
      });

      await getRiwayatDelegate(jenis, tx).create({
        data: {
          permohonanId: id,
          statusLama: existing.status,
          statusBaru: body.status,
          pesan: body.pesan_pemohon || null,
          changedByAdminId: admin.id
        }
      });

      return item;
    });

    // Data yang dicatat manual oleh admin tidak punya email maupun nomor
    // WhatsApp, dan sesuai requirement tidak pernah mengirim notifikasi.
    const adaPerubahan = existing.status !== updated.status || Boolean(body.pesan_pemohon);
    const notifikasi =
      !existing.inputManuallyEntered && adaPerubahan
        ? await kirimNotifikasiStatus({
            jenis,
            record: updated,
            status: updated.status,
            pesan: body.pesan_pemohon
          })
        : "dilewati";

    return NextResponse.json({ permohonan: updated, notifikasi });
  } catch {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }
}

/**
 * Ubah data permohonan oleh admin. Multipart karena lampiran boleh diganti.
 *
 * Tidak ada rate limit karena sudah di balik autentikasi, sama seperti POST
 * input manual. Status, pesan pemohon, dan catatan internal bukan bagian dari
 * endpoint ini; keduanya milik PATCH.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const jenis = resolveJenis(request);
  if (!jenis) return NextResponse.json({ message: "Jenis permohonan tidak valid." }, { status: 400 });

  const id = resolveId(params);
  if (!id) return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });

  try {
    const formData = await request.formData();
    const result = await updatePermohonanData({ jenis, id, formData, admin });

    // Checkbox "Kirim notifikasi ke pemohon" tidak terkirim saat dilepas.
    // Record manual tidak punya kontak, jadi tidak ada yang perlu dikirim.
    // Lampiran ikut masuk daftar perubahan: admin yang hanya mengganti surat
    // tetap harus diberi tahu, karena berkas yang mereka unduh berubah.
    const perubahan = [...result.perubahan, ...result.perubahanLampiran];

    // Checkbox "Kirim notifikasi ke pemohon" tidak terkirim saat dilepas.
    // Record manual tidak punya kontak, jadi tidak ada yang perlu dikirim.
    const mauNotifikasi = formData.get("kirim_notifikasi") === "1";
    const notifikasi =
      result.withKontak && mauNotifikasi && perubahan.length > 0
        ? await kirimNotifikasiPerubahan({ jenis, record: result.updated, perubahan })
        : "dilewati";

    return NextResponse.json({
      id,
      nomor_rujukan: result.nomorRujukan,
      jenis,
      perubahan: perubahan.map((item) => item.label),
      notifikasi
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Data tidak valid." },
        { status: 400 }
      );
    }

    if (error instanceof PermohonanEditError) {
      const notFound = error.message === "Data tidak ditemukan.";
      return NextResponse.json({ message: error.message }, { status: notFound ? 404 : 400 });
    }

    const message = error instanceof Error ? error.message : "Perubahan gagal disimpan.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

/**
 * Hapus satu permohonan beserta riwayat status dan lampirannya.
 *
 * Terpisah dari PUT dan PATCH karena sifatnya tidak sama: yang lain bisa
 * diulang, yang ini sekali jalan dan tidak ada tombol batal. Verifikasi
 * "¿yakin?" ada di sisi UI (HapusDataModal), bukan di sini, supaya endpoint
 * ini tetap bisa dipakai script tanpa perlu tanda kutip konfirmasi.
 *
 * Tidak ada rate limit, sama seperti POST dan PUT: semuanya sudah di balik
 * autentikasi admin.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const jenis = resolveJenis(request);
  if (!jenis) return NextResponse.json({ message: "Jenis permohonan tidak valid." }, { status: 400 });

  const id = resolveId(params);
  if (!id) return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });

  try {
    const result = await hapusPermohonan({ jenis, id, admin });
    return NextResponse.json({ ok: true, id, jenis, nomor_rujukan: result.nomorRujukan });
  } catch (error) {
    if (error instanceof PermohonanHapusError) {
      const notFound = error.message === "Data tidak ditemukan.";
      return NextResponse.json({ message: error.message }, { status: notFound ? 404 : 400 });
    }

    const message = error instanceof Error ? error.message : "Data gagal dihapus.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
