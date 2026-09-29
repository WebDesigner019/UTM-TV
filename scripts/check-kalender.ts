import assert from "node:assert/strict";
import {
  BARIS_KALENDER,
  awalMingguSenin,
  buildGridBulan,
  buildGridMinggu,
  geserBulan,
  jarakBulan,
  keTanggalKey,
  kunciBulan,
  rentangGrid,
  tanggalDariBulan,
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

console.log("\nnavigasi bulan:");

cek("geserBulan selalu mendarat di tanggal 1", () => {
  for (let i = -40; i <= 40; i += 1) {
    const hasil = geserBulan(new Date(2026, 8, 30), i);
    assert.equal(hasil.getDate(), 1, `tanggal bukan 1 pada geser ${i}`);
  }
});

cek("geserBulan melewati akhir tahun ke arah yang benar", () => {
  assert.equal(keTanggalKey(geserBulan(new Date(2026, 11, 1), 1)), "2027-01-01");
  assert.equal(keTanggalKey(geserBulan(new Date(2026, 0, 1), -1)), "2025-12-01");
  assert.equal(keTanggalKey(geserBulan(new Date(2026, 0, 1), -13)), "2024-12-01");
  // Dua kali melewati pergantian tahun, bukan hanya sekali.
  assert.equal(keTanggalKey(geserBulan(new Date(2026, 0, 1), 24)), "2028-01-01");
  assert.equal(keTanggalKey(geserBulan(new Date(2026, 0, 1), 25)), "2028-02-01");
});

cek("geserBulan bolak-balik selalu kembali ke bulan asal", () => {
  const dasar = new Date(2026, 8, 1);
  for (let i = 1; i <= 30; i += 1) {
    for (const [pergi, kembali] of [
      [i, -i],
      [-i, i]
    ]) {
      const asal = geserBulan(dasar, pergi);
      const balik = geserBulan(asal, kembali);
      assert.equal(keTanggalKey(balik), keTanggalKey(dasar), `tidak kembali pada geser ${pergi}`);
    }
  }
});

cek("kunciBulan mengabaikan hari dalam bulan", () => {
  // Hanya hari yang benar-benar ada. new Date() akan merolover "Februari 30"
  // ke Maret, jadi angka seperti itu tidak bisa dipakai sebagai masukan.
  for (let bulan = 0; bulan < 12; bulan += 1) {
    for (const hari of [1, 15, 28]) {
      assert.equal(
        kunciBulan(new Date(2026, bulan, hari)),
        keTanggalKey(new Date(2026, bulan, 1)),
        `gagal di ${bulan + 1} hari ${hari}`
      );
    }
  }
  // Bulan 31 hari boleh dipakai di bulan yang memang punya 31 hari.
  assert.equal(kunciBulan(new Date(2026, 0, 31)), "2026-01-01");
  assert.equal(kunciBulan(new Date(2026, 8, 30)), "2026-09-01");
  assert.equal(kunciBulan(new Date(2026, 11, 31)), "2026-12-01");
});

cek("jarakBulan negatif ke belakang, nol untuk bulan yang sama", () => {
  const bulanIni = new Date(2026, 8, 1);
  assert.equal(jarakBulan(bulanIni, bulanIni), 0);
  assert.equal(jarakBulan(bulanIni, geserBulan(bulanIni, 1)), 1);
  assert.equal(jarakBulan(bulanIni, geserBulan(bulanIni, -1)), -1);
  assert.equal(jarakBulan(bulanIni, geserBulan(bulanIni, 24)), 24);
  assert.equal(jarakBulan(bulanIni, geserBulan(bulanIni, -24)), -24);
});

cek("jarakBulan mengabaikan hari, jadi batas navigasi tidak bergeser", () => {
  // Batas dihitung dari tanggal 1. Kalau ikut hari, tanggal 30 bisa keluar
  // jalur sebulan sooner atau lebih lambat tergantung tanggalnya.
  const awal = new Date(2026, 8, 1);
  for (const hari of [1, 2, 15, 30]) {
    assert.equal(jarakBulan(awal, geserBulan(new Date(2026, 8, hari), 24)), 24, `hari ${hari}`);
  }
});

cek("tanggalDariBulan menolak bentuk yang salah, bukan merolover diam-diam", () => {
  for (const buruk of [
    "",
    "abc",
    "2026",
    "2026-",
    "-09",
    "2026-9",
    "2026-09-01",
    "2026-13",
    "2026-00",
    "2026-99",
    "2026-09-15",
    "2026/09",
    "2026-09-01T00:00",
    " 2026-09",
    "2026-09 ",
    "22026-09",
    "abcd-ef",
    "2026-0a"
  ]) {
    assert.equal(tanggalDariBulan(buruk), null, `harus ditolak: ${JSON.stringify(buruk)}`);
  }
});

cek("tanggalDariBulan menerima bulan yang benar dan selalu tanggal 1", () => {
  for (let bulan = 1; bulan <= 12; bulan += 1) {
    const teks = `2026-${String(bulan).padStart(2, "0")}`;
    const hasil = tanggalDariBulan(teks);
    assert.ok(hasil, `harus diterima: ${teks}`);
    assert.equal(keTanggalKey(hasil), `${teks}-01`, `tanggal bukan 1: ${teks}`);
  }
});

cek("kunciBulan sesuai dengan grid bulan yang dibangun dari kunci itu", () => {
  // Komponen memakai kunciBulan(today) sebagai bulan yang tampil, lalu
  // buildGridBulan() menggambar gridnya. Keduanya harus sepakat soal bulan:
  // grid untuk September tidak boleh memuat satu pun hari dari Oktober.
  for (let i = -30; i <= 30; i += 1) {
    const kunci = kunciBulan(geserBulan(new Date(2026, 8, 1), i));
    const dalamBulan = buildGridBulan(tanggalDariKey(kunci)).flat().filter((s) => s.bulanIni);
    const jumlahHari = new Date(2026, 8 + i + 1, 0).getDate();

    assert.equal(dalamBulan[0].key, kunci, `awal bulan meleset pada geser ${i}`);
    assert.equal(dalamBulan.length, jumlahHari, `jumlah hari meleset pada geser ${i}`);
    for (const sel of dalamBulan) {
      assert.ok(sel.key.startsWith(kunci.slice(0, 7)), `${sel.key} di luar bulan pada geser ${i}`);
    }
  }
});

console.log(`\n${jumlah} pemeriksaan kalender lolos.`);
