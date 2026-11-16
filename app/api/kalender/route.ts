import { NextResponse } from "next/server";
import { getKalenderPermohonan, isKalenderPublikAktif } from "@/lib/kalender";
import {
  MAKS_GESER_BULAN,
  jarakBulan,
  keTanggalKey,
  rentangGrid,
  tanggalDariBulan,
  tanggalDariKey
} from "@/lib/kalender-grid";
import { todayISO } from "@/lib/status";

export const dynamic = "force-dynamic";

/**
 * JSON kalender tidak boleh disimpan cache perantara mana pun. Klien meminta
 * URL berbeda per bulan (?bulan=YYYY-MM), tapi tanpa header ini browser atau
 * CDN di depan aplikasi boleh menjawab dari cache dan grid menampilkan event
 * bulan yang salah di bawah judul bulan yang benar.
 */
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

/**
 * Event kalender untuk satu bulan, dipanggil klien saat pengguna memindah
 * bulan. Tanpa ini kalender hanya bisa menampilkan bulan yang sedang berjalan.
 *
 * Kolom yang dikirim tetap yang sama dengan landing page, karena
 * getKalenderPermohonan() yang menyaring daftar kolom. Endpoint ini tidak
 * membuka data baru apa pun, hanya memberi jalan kedua ke data yang sudah
 * publik itu.
 */
export async function GET(req: Request) {
  // Saklar yang sama dengan landing page. Kalau dimatikan admin, kalender
  // harus hilang juga di sini, bukan hanya jadi kosong.
  const aktif = await isKalenderPublikAktif();
  if (!aktif) return NextResponse.json({ aktif: false }, { headers: NO_STORE_HEADERS });

  const diminta = new URL(req.url).searchParams.get("bulan") ?? todayISO().slice(0, 7);
  const bulan = tanggalDariBulan(diminta);
  if (!bulan) {
    return NextResponse.json(
      { aktif: true, galat: "Format bulan harus YYYY-MM, misalnya 2026-09." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  // Batas yang sama dengan tombol panahnya di klien. Tanpa ini endpoint publik
  // ini bisa dipanggil untuk bulan berapa pun, dan setiap panggilan adalah
  // empat query ke database.
  const geser = jarakBulan(tanggalDariKey(todayISO()), bulan);
  if (Math.abs(geser) > MAKS_GESER_BULAN) {
    return NextResponse.json(
      { aktif: true, galat: `Hanya ${MAKS_GESER_BULAN} bulan dari bulan berjalan yang bisa dibuka.` },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const events = await getKalenderPermohonan(rentangGrid(bulan));
  return NextResponse.json(
    { aktif: true, bulan: keTanggalKey(bulan), events },
    { headers: NO_STORE_HEADERS }
  );
}
