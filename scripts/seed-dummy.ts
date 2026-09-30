import fs from "fs/promises";
import path from "path";
import { createRequire } from "node:module";
import type { StatusPermohonan } from "@prisma/client";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");

loadEnvConfig(process.cwd());

import { prisma } from "@/lib/prisma";
import { createWithNomorRujukan } from "@/lib/permohonan-create";
import { hapusPermohonan } from "@/lib/permohonan-delete";
import { getPermohonanDelegate } from "@/lib/permohonan-record";
import { getUploadDir } from "@/lib/env";
import { JENIS_OPTIONS, STATUS_LABEL, type JenisPermohonan } from "@/lib/status";

/**
 * Seeder data dummy untuk mencoba dashboard, kalender, filter, halaman detail,
 * lacak, dan fitur hapus tanpa menunggu pengajuan sungguhan.
 *
 * Semua tanggal pengajuan dan tanggal acara dipatok di bulan berjalan. Data
 * yang tersebar ke bulan lain membuat tampilan yang sedang diuji tidak realistis,
 * dan kalender tidak pernah terisi event.
 *
 * Repo ini belum punya test runner, jadi ini skrip yang dipanggil manual:
 * npm run db:seed:dummy
 *
 * PAKAI:
 *   npm run db:seed:dummy                      bersihkan yang lama, lalu seed 24
 *   npm run db:seed:dummy -- --jumlah 40       jumlah record lain
 *   npm run db:seed:dummy -- --tanpa-bersihkan tambah tanpa menghapus
 *   npm run db:seed:dummy -- --bersihkan       hanya hapus data dummy
 *
 * Data dummy selalu ditandai di catatan_internal, jadi --bersihkan hanya
 * menyentuh data bertanda itu dan tidak pernah data asli.
 */

/** Penanda di catatan_internal. Hapus data dummy bergantung pada string ini. */
const TANDAN = "[dummy]";

const JUMLAH_DEFAULT = 24;

/** Adapter WhatsApp pseudo, format yang dipakai kontak penanggung jawab. */
const NO_WA = "+628123450";

// ------------------------------------------------------------------ helper

function flagAda(nama: string) {
  return process.argv.includes(`--${nama}`);
}

function nilaiArgumen(nama: string): string | null {
  const prefix = `--${nama}=`;
  const found = process.argv.find((item) => item.startsWith(prefix));
  if (found) return found.slice(prefix.length);
  return flagAda(nama) ? "true" : null;
}

// ---------------------------------------------------------------- kalender

const SEKARANG = new Date();
const TAHUN = SEKARANG.getUTCFullYear();
const BULAN = SEKARANG.getUTCMonth();

/** Jumlah hari dalam bulan berjalan. */
const HARI_DALAM_BULAN = new Date(Date.UTC(TAHUN, BULAN + 1, 0)).getUTCDate();

/**
 * Tanggal di bulan berjalan pada tengah malam UTC.
 *
 * UTC dipakai karena kolom tanggal bertipe @db.Date dan dibaca Prisma sebagai
 * tengah malam UTC. Kalau tanggal dibuat dari zona waktu lokal, WIB bisa mundur
 * sehari dan record mendarat di tanggal yang salah.
 */
function tanggal(hari: number) {
  const clamp = Math.min(Math.max(hari, 1), HARI_DALAM_BULAN);
  return new Date(Date.UTC(TAHUN, BULAN, clamp));
}

/**
 * createdAt pada hari tertentu di bulan berjalan, jam acak.
 *
 * Hari dibatasi sampai hari ini karena dashboard mengurutkan berdasarkan tanggal
 * menurun: record yang dibuat di masa depan akan menduduki posisi teratas dengan
 * tanggal yang belum pernah terjadi.
 */
function dibuatPadaUntuk(hari: number) {
  const maks = Math.min(hari, SEKARANG.getUTCDate());
  const jam = 8 + Math.floor(Math.random() * 9);
  return new Date(Date.UTC(TAHUN, BULAN, Math.max(maks, 1), jam, 0, 0));
}

// ---------------------------------------------------------------- data PDF

/**
 * PDF satu halaman yang valid, dibuat tangan.
 *
 * Berkas dummy ini dipakai menguji tombol unduh, preview di iframe, dan
 * daftar lampiran pada dialog hapus. PDF yang rusak membuat ketiganya gagal
 * dengan cara yang menyesatkan, jadi struktur xref-nya dihitung betulan.
 */
function buatPdf(judul: string, baris: string[]): Buffer {
  const escape = (teks: string) =>
    teks.replace(/[^\x20-\x7e]/g, "-").replace(/([\\()])/g, "\\$1");

  const isi = [
    "BT",
    "/F1 16 Tf",
    "60 780 Td",
    `(${escape(judul)}) Tj`,
    "/F1 10 Tf",
    ...baris.flatMap((baris) => ["0 -22 Td", `(${escape(baris)}) Tj`]),
    "ET"
  ].join("\n");

  const objek = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(isi, "latin1")} >>\nstream\n${isi}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];

  let pdf = "%PDF-1.4\n";
  const offset: number[] = [];

  objek.forEach((body, index) => {
    offset.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const mulaiXref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objek.length + 1}\n0000000000 65535 f \n`;
  for (const posisi of offset) {
    pdf += `${String(posisi).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objek.length + 1} /Root 1 0 R >>\nstartxref\n${mulaiXref}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

type Lampiran = { path: string; originalName: string; sizeBytes: number };

async function simpanPdf(nama: string, judul: string, baris: string[]): Promise<Lampiran> {
  const buffer = buatPdf(judul, baris);
  const dir = getUploadDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, nama), buffer);
  return { path: nama, originalName: nama, sizeBytes: buffer.length };
}

// -------------------------------------------------------------- data dummy

/**
 * Isi tabel dibentuk dari daftar kata pendek yang disejajarkan per indeks.
 *
 * Menulis 24 baris lengkap terlalu panjang dan mudah salah ketik, sedangkan
 * daftar singkat di bawah bisa dicek mata satu per satu dan tetap menghasilkan
 * kombinasi yang berbeda tiap jenis.
 */
const ACARA: Record<JenisPermohonan, string[]> = {
  liputan: ["Sidang Skripsi", "Pelantikan BEM", "Film Dokumenter", "Turnamen Futsal", "Kuliah Wawasan", "Pekan Ilmiah"],
  media_partner: ["Hari Jadi", "Hari Jadi Himpunan", "Profil Fakultas", "Seminar Beasiswa", "Latihan Kepemimpinan"],
  kerjasama: ["Buku Kolektif", "Pameran Karya", "Podcast Edukasi", "Film Pendek", "Laptop Sekolah"],
  peminjaman_podcast: ["Roda Pers", "Obrolan Alumni", "Ngobrol Kopi", "Wawancara Kafe", "Rekaman Konser"]
};

const INSTANSI: Record<JenisPermohonan, string[]> = {
  liputan: ["Fakultas Teknik", "BEM", "Pusat Multimedia", "HMSI", "Himpunan Ekonomi", "Fakultas Ekonomi"],
  media_partner: ["Klub Pecinta Alam", "Himpunan Hukum", "FISIP", "UPT Beasiswa", "Lembaga Mahasiswa"],
  kerjasama: ["Perpustakaan", "Fakultas Teknik", "Studio Podcast", "Komunitas Sineas", "Dinas Pendidikan"],
  peminjaman_podcast: ["Redaksi Media", "Ikatan Alumni", "Komunitas Podcast", "Himpunan Teknik", "Majelis"]
};

const TEMPAT = ["Auditorium FTI", "Lapangan Kampus", "Ruang Balek", "Lapangan Futsal", "Ruang Kelas", "Gedung Serbaguna"];

/**
 * Jam acara untuk data dummy liputan.
 *
 * Tidak semua baris diberi waktu: kolom waktu_acara di database nullable dan
 * pemohon memang boleh melewatkannya, jadi seed harus menyisakan baris kosong
 * agar kolom "Waktu" di dashboard benar-benar menguji tampilan "-" dan bukan
 * selalu berisi.
 */
const WAKTU_ACARA = ["08:00", "09:30", "10:00", "13:00", "15:30", "19:00"];

const NAMA = ["Rina", "Fajar", "Dimas", "Bayu", "Nadia", "Rizky", "Sari", "Andi", "Maya", "Tomi", "Gita", "Laras"];

/** Email kampus, domain yang lolos isAllowedCampusEmail. */
const emailUntuk = (nama: string) => `${nama}@student.trunojoyo.ac.id`;

/** Nomor telepon pseudo dengan empat digit akhir yang berbeda tiap baris. */
const kontakUntuk = (index: number, nama: string) => `${nama} (${NO_WA}${String(index).padStart(4, "0")})`;

/** Rangkaian status yang wajar untuk sebuah pengajuan, dari masuk sampai akhir. */
const RENTANG_STATUS: StatusPermohonan[] = ["diterima", "disetujui", "selesai"];

/**
 * Status akhir yang diputar bergiliran.
 *
 * Dipisah dari RENTANG_STATUS karena yang satu adalah jalur riwayat, sedangkan
 * yang ini hanya menukar status akhir antar record. Ditolak sengaja ikut
 * siklus supaya filter status di dashboard tidak cuma punya tiga pilihan.
 */
const SIKLUS_STATUS: StatusPermohonan[] = ["diterima", "disetujui", "selesai", "ditolak"];
const PESAN_STATUS: Record<StatusPermohonan, string | null> = {
  diterima: null,
  disetujui: "Pengajuan disetujui. Tim akan menghubungi Anda untuk koordinasi teknis.",
  ditolak: "Mohon maaf, pengajuan belum dapat kami proses pada jadwal tersebut.",
  selesai: "Liputan sudah selesai di lapangan. Terima kasih atas kerjasamanya."
};

/**
 * Baris status_history yang sesuai dengan status akhir sebuah record.
 *
 * Ditolak punya jalur sendiri: RENTANG_STATUS tidak memuatnya, jadi
 * indexOf() mengembalikan -1 dan pemotongan jalur menghasilkan array kosong.
 */
function riwayatUntuk(status: StatusPermohonan, dibuat: Date, adminId: number | null) {
  const jalur: StatusPermohonan[] =
    status === "ditolak"
      ? ["diterima", "ditolak"]
      : RENTANG_STATUS.slice(0, RENTANG_STATUS.indexOf(status) + 1);

  return jalur.map((statusBaru, index) => ({
    statusLama: index === 0 ? null : jalur[index - 1],
    statusBaru,
    pesan: PESAN_STATUS[statusBaru],
    changedByAdminId: statusBaru === "diterima" ? null : adminId,
    createdAt: new Date(dibuat.getTime() + index * 24 * 60 * 60 * 1000)
  }));
}

// ------------------------------------------------------------------ insert

type Hasil = { jenis: JenisPermohonan; jumlah: number };

async function seed(jumlah: number, adminId: number | null): Promise<Hasil[]> {
  const hasil: Hasil[] = [];

  for (const jenis of JENIS_OPTIONS) {
    const acara = ACARA[jenis];
    const instansi = INSTANSI[jenis];
    // Jumlah per jenis dibagi rata, sisa pembagian masuk ke jenis terakhir.
    const perJenis = Math.max(Math.ceil(jumlah / JENIS_OPTIONS.length), 1);
    let dibuat = 0;

    for (let i = 0; i < perJenis; i += 1) {
      // Indeks diputar supaya jumlah yang diminta bebas tanpa data duplikat.
      const slot = i % acara.length;
      // Nomor batch ditambahkan begitu daftar dasar sudah terpakai, supaya
      // nama acara tetap berbeda walau jumlah record dibuat lebih banyak.
      const batch = Math.floor(i / acara.length);
      const namaAcara = batch === 0 ? acara[slot] : `${acara[slot]} Batch ${batch + 1}`;
      const namaInstansi = instansi[slot % instansi.length];
      const hari = 1 + ((i * 5) % Math.max(SEKARANG.getUTCDate(), 1));
      const hariAcara = Math.min(hari + 6, HARI_DALAM_BULAN);
      const status = SIKLUS_STATUS[i % SIKLUS_STATUS.length];
      const dibuatPada = dibuatPadaUntuk(hari);
      const pengaju = NAMA[i % NAMA.length];
      const kontak = kontakUntuk(i + 1, pengaju);

      // Record manual dicatat admin lewat "Tambah Data": tidak punya kontak
      // pemohon dan tidak pernah punya lampiran, sama seperti di aplikasi.
      const manual = jenis === "kerjasama" && i === perJenis - 1;
      const namaBase = `dummy-${jenis}-${i + 1}`;

      const isiSurat = [
        `Instansi: ${namaInstansi}`,
        `Diajukan: ${dibuatPada.toISOString().slice(0, 10)}`,
        `Status: ${STATUS_LABEL[status]}`
      ];

      // Tiga jenis punya satu kolom lampiran, podcast punya dua. Berkasnya
      // harus benar-benar ditulis ke storage: kalau hanya kolomnya yang diisi,
      // tombol unduh dan dialog hapus akan melaporkan berkas yang tidak ada.
      //
      // Bolak-baliknya juga dijaga: berkas yang tidak dirujuk kolom mana pun
      // tidak akan terhapus waktu data dummy dibersihkan, karena hapusPermohonan
      // hanya tahu path dari kolom file. Setiap berkas yang ditulis di bawah
      // wajib punya kolomnya.
      const podcast = jenis === "peminjaman_podcast";
      const file =
        manual || podcast
          ? null
          : await simpanPdf(`${namaBase}.pdf`, `Surat Pengajuan ${namaAcara}`, isiSurat);

      const rekom = manual || !podcast
        ? null
        : await simpanPdf(`${namaBase}-rekom.pdf`, "Surat Rekomendasi BAKK", [
            `Untuk: ${namaInstansi}`,
            `Acara: ${namaAcara}`
          ]);
      const pernyataan = manual || !podcast
        ? null
        : await simpanPdf(`${namaBase}-pernyataan.pdf`, "Surat Pernyataan", [
            `Nama: ${pengaju}`,
            `Acara: ${namaAcara}`
          ]);

      /** Kolom lampiran tunggal, dipakai tiga jenis selain podcast. */
      const kolomFile = file
        ? {
            filePath: file.path,
            fileOriginalName: file.originalName,
            fileMimeType: "application/pdf",
            fileSizeBytes: file.sizeBytes
          }
        : {};

      const riwayat = riwayatUntuk(status, dibuatPada, adminId);

      switch (jenis) {
        case "liputan":
          await createWithNomorRujukan("LIP", (nomorRujukan) =>
            prisma.permohonanLiputan.create({
              data: {
                nomorRujukan,
                namaInstansi,
                namaAcara,
                tanggalAcara: tanggal(hariAcara),
                waktuAcara: i % 3 === 0 ? null : WAKTU_ACARA[slot % WAKTU_ACARA.length],
                tempatAcara: TEMPAT[slot % TEMPAT.length],
                detailPesertaAudiens: `Sekitar ${50 + i * 25} peserta`,
                email: manual ? null : emailUntuk(namaInstansi),
                noWa: manual ? null : kontak.match(/\d{9,}/)?.[0] ?? null,
                status,
                pesanPemohon: status === "diterima" ? null : PESAN_STATUS[status],
                catatanInternal: `${TANDAN} Data contoh, bukan pengajuan sungguhan.`,
                inputManuallyEntered: manual,
                createdAt: dibuatPada,
                statusHistory: { create: riwayat },
                ...kolomFile
              }
            })
          );
          break;

        case "media_partner":
          await createWithNomorRujukan("MP", (nomorRujukan) =>
            prisma.permohonanMediaPartner.create({
              data: {
                nomorRujukan,
                fakultasOrganisasi: namaInstansi,
                namaAcara,
                tanggalRequestUpload: tanggal(hariAcara),
                kontakPenanggungJawab: kontak,
                email: manual ? null : emailUntuk(namaInstansi),
                status,
                pesanPemohon: status === "diterima" ? null : PESAN_STATUS[status],
                catatanInternal: `${TANDAN} Data contoh, bukan pengajuan sungguhan.`,
                inputManuallyEntered: manual,
                createdAt: dibuatPada,
                statusHistory: { create: riwayat },
                ...kolomFile
              }
            })
          );
          break;

        case "kerjasama":
          await createWithNomorRujukan("KJ", (nomorRujukan) =>
            prisma.permohonanKerjasama.create({
              data: {
                nomorRujukan,
                fakultasOrganisasi: namaInstansi,
                namaAcara,
                tanggalRequestUpload: tanggal(hariAcara),
                kontakPenanggungJawab: kontak,
                email: manual ? null : emailUntuk(namaInstansi),
                status,
                pesanPemohon: status === "diterima" ? null : PESAN_STATUS[status],
                catatanInternal: `${TANDAN} Data contoh, bukan pengajuan sungguhan.`,
                inputManuallyEntered: manual,
                createdAt: dibuatPada,
                statusHistory: { create: riwayat },
                ...kolomFile
              }
            })
          );
          break;

        case "peminjaman_podcast":
          await createWithNomorRujukan("PP", (nomorRujukan) =>
            prisma.permohonanPeminjamanPodcast.create({
              data: {
                nomorRujukan,
                namaInstansi,
                namaAcara,
                tanggalPeminjaman: tanggal(hariAcara),
                waktuMulai: "09:00",
                waktuSelesai: "11:00",
                kontakPenanggungJawab: kontak,
                noteDetail: `Durasi 2 jam, ${file ? "dengan dua mikrofon" : "tanpa lampiran"}`,
                email: manual ? null : emailUntuk(namaInstansi),
                status,
                pesanPemohon: status === "diterima" ? null : PESAN_STATUS[status],
                catatanInternal: `${TANDAN} Data contoh, bukan pengajuan sungguhan.`,
                inputManuallyEntered: manual,
                createdAt: dibuatPada,
                statusHistory: { create: riwayat },
                // Podcast tidak punya kolom filePath, jadi kolomFile tidak
                // boleh ikut spread ke sini.
                fileRekomBakkPath: rekom?.path ?? null,
                fileRekomBakkOriginalName: rekom?.originalName ?? null,
                fileRekomBakkMimeType: rekom ? "application/pdf" : null,
                fileRekomBakkSizeBytes: rekom?.sizeBytes ?? null,
                filePernyataanPath: pernyataan?.path ?? null,
                filePernyataanOriginalName: pernyataan?.originalName ?? null,
                filePernyataanMimeType: pernyataan ? "application/pdf" : null,
                filePernyataanSizeBytes: pernyataan?.sizeBytes ?? null
              }
            })
          );
          break;
      }

      dibuat += 1;
    }

    hasil.push({ jenis, jumlah: dibuat });
  }

  return hasil;
}

// ------------------------------------------------------------------ hapus

/**
 * Hapus semua record bertanda [dummy] beserta lampirannya.
 *
 * Dipakai hapusPermohonan, bukan deleteMany, supaya berkas di storage ikut
 * hilang persis seperti saat admin menghapus lewat UI.
 */
async function bersihkanDummy(): Promise<number> {
  let total = 0;

  for (const jenis of JENIS_OPTIONS) {
    const rows = await getPermohonanDelegate(jenis).findMany({
      where: { catatanInternal: { contains: TANDAN } },
      select: { id: true }
    });

    for (const row of rows) {
      await hapusPermohonan({ jenis, id: row.id, admin: { id: 0, nama: "Seeder" } });
      total += 1;
    }
  }

  return total;
}

// ------------------------------------------------------------------- main

async function main() {
  // Menjalankan seeder di production berarti mengisi tabel pengajuan dengan
  // data palsu, dan tidak ada tombol yang bisa membedakannya dari data asli.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeder data dummy tidak boleh jalan di NODE_ENV=production.");
  }

  const jumlah = Math.max(Number(nilaiArgumen("jumlah") ?? JUMLAH_DEFAULT) || JUMLAH_DEFAULT, 1);
  const hanyaHapus = flagAda("bersihkan");
  const tanpaBersihkan = flagAda("tanpa-bersihkan");

  if (!tanpaBersihkan || hanyaHapus) {
    const dihapus = await bersihkanDummy();
    console.log(`Data dummy lama dihapus: ${dihapus} record.`);
  }

  if (hanyaHapus) {
    console.log("Selesai. Tidak ada data baru yang ditambahkan.");
    return;
  }

  const admin = await prisma.admin.findFirst({ select: { id: true } });

  console.log(`Menyemai ${jumlah} record dummy untuk bulan ${BULAN + 1}/${TAHUN}...`);
  const hasil = await seed(jumlah, admin?.id ?? null);

  for (const item of hasil) {
    console.log(`  ${item.jenis.padEnd(20)} ${item.jumlah} record`);
  }

  const total = hasil.reduce((jumlah, item) => jumlah + item.jumlah, 0);
  console.log(`\nSelesai. ${total} record dummy ditambah, ditandai "${TANDAN}" pada catatan internal.`);
  console.log("Hapus lagi dengan: npm run db:seed:dummy -- --bersihkan");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
