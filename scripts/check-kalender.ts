import assert from "node:assert/strict";
import {
  BARIS_KALENDER,
  awalMingguSenin,
  buildGridBulan,
  buildGridMinggu,
  keTanggalKey,
  rentangGrid,
  tanggalDariKey,
  tambahHari
} from "../lib/kalender-grid";

/**
 * Pemeriksaan matematika kalender.
 *
 * Repo ini belum punya test runner, jadi ini skrip yang dipanggil manual:
 * npm run check:kalender.
 *
 * Fokusnya sel yang salah tapi tetap bisu: awal minggu meleset, grid bulan
 * kekurangan baris sehingga tanggal terakhir bulan hilang, atau kunci tanggal
 * bergeser satu hari karena zona waktu.
 */

let jumlah = 0;

function cek(nama: string, fn: () => void) {
  fn();
  jumlah += 1;
  console.log(`  ok  ${nama}`);
}

/** Key "YYYY-MM-DD" dari satu sel, buat perbandingan yang enak dibaca. */
function key(sel: { key: string }) {
  return sel.key;
}

/** Tanggal tengah malam UTC dari sel, untuk dibandingkan dengan rentang query. */
function utcSel(sel: { tanggal: Date }) {
  return new Date(
    Date.UTC(sel.tanggal.getFullYear(), sel.tanggal.getMonth(), sel.tanggal.getDate())
  );
}

console.log("awalMingguSenin harus selalu mengembalikan Senin:");

cek("Senin itu sendiri tidak bergeser", () => {
  assert.equal(keTanggalKey(awalMingguSenin(new Date(2026, 8, 28))), "2026-09-28");
  assert.equal(awalMingguSenin(new Date(2026, 8, 28)).getDay(), 1);
});

cek("Sabtu mundur lima hari", () => {
  assert.equal(keTanggalKey(awalMingguSenin(new Date(2026, 9, 3))), "2026-09-28");
});

cek("Minggu mundur satu hari", () => {
  assert.equal(keTanggalKey(awalMingguSenin(new Date(2026, 9, 4))), "2026-09-28");
});

cek("jarak awal minggu ke akhir minggu selalu enam hari", () => {
  for (let i = 0; i < 40; i += 1) {
    const mulai = awalMingguSenin(tambahHari(new Date(2026, 0, 1), i));
    const akhir = tambahHari(mulai, 6);
    const selisih =
      (utcSel({ tanggal: akhir }).getTime() - utcSel({ tanggal: mulai }).getTime()) / 86400000;
    assert.equal(selisih, 6, `pecah di ${keTanggalKey(mulai)}`);
  }
});

console.log("\nbuildGridBulan harus 6 x 7 sel berurutan tanpa kehilangan tanggal:");

cek("Februari 2021: 28 hari, tanggal 1 hari Senin, grid mulai di tanggal 1", () => {
  const grid = buildGridBulan(new Date(2021, 1, 15));
  assert.equal(grid.length, BARIS_KALENDER);
  assert.ok(grid.every((baris) => baris.length === 7));
  assert.equal(key(grid[0][0]), "2021-02-01");
  // 28 Februari 2021 jatuh di baris ke-4, bukan ke-5.
  assert.equal(key(grid[3][6]), "2021-02-28");
});

cek("Februari 2024: tahun kabisatan 29 hari", () => {
  const grid = buildGridBulan(new Date(2024, 1, 10));
  assert.equal(key(grid[0][0]), "2024-01-29");
  assert.equal(key(grid[4][0]), "2024-02-26");
  assert.equal(grid[4][0].bulanIni, true);
});

cek("Agustus 2020: 31 hari mulai Sabtu, tanggal 31 wajib ada di baris keenam", () => {
  const grid = buildGridBulan(new Date(2020, 7, 15));
  assert.equal(key(grid[0][0]), "2020-07-27");
  // Kalau gridnya cuma lima baris, 31 Agustus akan ikut terpotong.
  assert.equal(key(grid[5][0]), "2020-08-31");
  assert.equal(key(grid[5][6]), "2020-09-06");
});

cek("setiap bulan 2024-2027 menandai tepat semua hari miliknya", () => {
  for (let tahun = 2024; tahun <= 2027; tahun += 1) {
    for (let bulan = 0; bulan < 12; bulan += 1) {
      const jumlahHariBulan = new Date(tahun, bulan + 1, 0).getDate();
      const milikBulan = buildGridBulan(new Date(tahun, bulan, 1))
        .flat()
        .filter((sel) => sel.bulanIni);

      assert.equal(milikBulan.length, jumlahHariBulan, `${tahun}-${bulan + 1} jumlah hari`);
      assert.equal(milikBulan[0].tanggal.getDate(), 1, `${tahun}-${bulan + 1} tanggal awal`);
      assert.equal(
        milikBulan[jumlahHariBulan - 1].tanggal.getDate(),
        jumlahHariBulan,
        `${tahun}-${bulan + 1} tanggal akhir`
      );
      assert.ok(
        milikBulan.every((sel) => sel.tanggal.getMonth() === bulan),
        `${tahun}-${bulan + 1} ada sel dari bulan lain`
      );
    }
  }
});

cek("kunci tanggal tidak pernah bergeser satu hari", () => {
  for (let i = 0; i < 60; i += 1) {
    const tanggal = tambahHari(new Date(2026, 0, 1), i);
    assert.equal(tanggalDariKey(keTanggalKey(tanggal)).getDate(), tanggal.getDate());
  }
});

console.log("\nbuildGridMinggu:");

cek("minggu berjalan selalu di dalam grid bulan berjalan", () => {
  // Tidak ada tombol navigasi di kalender, jadi satu bulan yang diambil harus
  // selalu cukup untuk "Minggu ini". Kalau ini pecah, minggu berjalan bisa
  // menampilkan hari kosong padahal datanya ada.
  for (let i = 0; i < 400; i += 1) {
    const hariIni = tambahHari(new Date(2026, 0, 1), i);
    const minggu = buildGridMinggu(hariIni);
    const selBulan = buildGridBulan(hariIni).flat();

    assert.equal(minggu.length, 7);
    assert.equal(
      minggu.filter((sel) => selBulan.some((bulan) => bulan.key === sel.key)).length,
      7,
      `minggu ${keTanggalKey(hariIni)} keluar dari grid bulan`
    );
  }
});

cek("minggu berjalan selalu di dalam rentang query", () => {
  for (let i = 0; i < 400; i += 1) {
    const hariIni = tambahHari(new Date(2026, 0, 1), i);
    const { dari, sampai } = rentangGrid(hariIni);

    for (const sel of buildGridMinggu(hariIni)) {
      const tengahMalam = utcSel(sel);
      assert.ok(tengahMalam >= dari, `${sel.key} sebelum batas dari`);
      assert.ok(tengahMalam < sampai, `${sel.key} lewat batas sampai`);
    }
  }
});

console.log("\nrentangGrid:");

cek("batas tengah malam UTC, dilebihkan satu hari di kedua ujung", () => {
  // September 2026 mulai Selasa, jadi grid mulai Senin 31 Agustus 2026.
  const { dari, sampai } = rentangGrid(new Date(2026, 8, 15));
  assert.equal(dari.toISOString(), "2026-08-30T00:00:00.000Z");
  assert.equal(sampai.toISOString(), "2026-10-13T00:00:00.000Z");
});

cek("sampai selalu eksklusif dan mencakup semua sel grid", () => {
  for (let i = 0; i < 400; i += 1) {
    const hariIni = tambahHari(new Date(2026, 0, 1), i);
    const { dari, sampai } = rentangGrid(hariIni);
    const selBulan = buildGridBulan(hariIni).flat();

    assert.ok(sampai > dari, "rentang terbalik");
    for (const sel of selBulan) {
      const tengahMalam = utcSel(sel);
      assert.ok(tengahMalam >= dari, `${sel.key} di luar batas dari`);
      assert.ok(tengahMalam < sampai, `${sel.key} di luar batas sampai`);
    }
  }
});

console.log(`\n${jumlah} pemeriksaan kalender lolos.`);
