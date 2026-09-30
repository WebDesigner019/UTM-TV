"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useModalDismiss } from "@/components/useModalDismiss";
import {
  HARI_MINGGU,
  MAKS_GESER_BULAN,
  buildGridBulan,
  geserBulan,
  jarakBulan,
  judulBulan,
  kunciBulan,
  tanggalDariKey,
  type EventKalender
} from "@/lib/kalender-grid";
import { JENIS_KALENDER, JENIS_OPTIONS, formatTanggal, type JenisPermohonan } from "@/lib/status";

/**
 * Urutan isi sel kalender, dua kolom dua baris.
 *
 * Satu konstanta ini yang menentukan letak keempat jenis di semua sel. Dan
 * urutan datar-liniernya sekaligus menentukan urutan pengisian: kalau ada
 * jenis yang kosong, jenis berikutnya naik ke kotak yang lebih awal.
 *
 *   (0,0) liputan  ->  (0,1) media_partner  ->  (1,0) kerjasama  ->  (1,1) peminjaman_podcast
 *
 * Jadi hari yang hanya punya satu pengajuan menampilkannya di kiri-atas, dan
 * hari yang punya empat memenuhi petak 2x2 dari kiri-atas ke kanan-bawah.
 * Kotak yang kosong tidak pernah digambar: pada layar lebar petak kosong jadi
 * kotak abu yang hanya soal ruang, bukan informasi, dan di ponsel tidak ada
 * tempatnya sama sekali.
 *
 * Konsekuensinya, posisi petak bergantung pada isi hari itu. Hari berbeda
 * bisa menaruh jenis yang sama di kotak berbeda, dan itu memang yang
 * dimaksud supaya hari yang sepi tidak menyisakan deretan kotak kosong.
 *
 * Dipakai di dua tempat: di ponsel petaknya digambar sesuai urutan ini, di
 * layar lebar grid yang sama diisi teks jenisnya. Keduanya membaca daftar
 * isi yang sama, jadi tidak mungkin berbeda.
 */
const PETAK = [
  ["liputan", "media_partner"],
  ["kerjasama", "peminjaman_podcast"]
] as const satisfies readonly (readonly JenisPermohonan[])[];

/**
 * Kalender pengajuan untuk landing page.
 *
 * Bulan pertama sudah diambil server dan dikirim lewat prop, jadi render pertama
 * tidak menunggu jaringan sama sekali. Bulan berikutnya diambil klien dari
 * /api/kalender ketika pengguna memindah bulan.
 *
 * "today" dikirim sebagai prop, bukan dihitung ulang di klien, karena dua
 * tempat memanggil new Date() bisa berbeda di batas tengah malam. Dari situ
 * bulan yang tampil diturunkan pakai potongan string, jadi server dan klien
 * selalu menghitung bulan pertama yang sama.
 *
 * Saringan jenis disimpan di state, bukan di query param, supaya URL landing
 * page tetap bersih.
 */
export function KalenderPermohonan({
  events,
  today
}: {
  events: EventKalender[];
  /** "YYYY-MM-DD" tanggal server pakai untuk menandai hari ini. */
  today: string;
}) {
  const [jenisAktif, setJenisAktif] = useState<JenisPermohonan[]>([...JENIS_OPTIONS]);
  const [hariDipilih, setHariDipilih] = useState<string | null>(null);
  const [bulan, setBulan] = useState(() => kunciBulan(tanggalDariKey(today)));
  const [eventsBulan, setEventsBulan] = useState<EventKalender[]>(events);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const bulanIni = kunciBulan(tanggalDariKey(today));
  const geser = jarakBulan(tanggalDariKey(bulanIni), tanggalDariKey(bulan));

  const anchorTanggal = useMemo(() => tanggalDariKey(bulan), [bulan]);

  const grid = useMemo(() => buildGridBulan(anchorTanggal), [anchorTanggal]);

  const eventPerTanggal = useMemo(() => {
    const map = new Map<string, EventKalender[]>();
    for (const event of eventsBulan) {
      if (!jenisAktif.includes(event.jenis)) continue;
      const list = map.get(event.tanggal);
      if (list) list.push(event);
      else map.set(event.tanggal, [event]);
    }
    return map;
  }, [eventsBulan, jenisAktif]);

  /**
   * Jumlah event per tanggal per jenis.
   *
   * Dipisah dari daftar event karena petak di sel sekarang menunjukkan
   * hitungan, bukan nama jenis. Menghitung ulang dari daftar tiap render
   * tidak masalah: empat jenis dan satu bulan, jadi paling banyak 28 angka.
   */
  const jumlahPerJenis = useMemo(() => {
    const map = new Map<string, Map<JenisPermohonan, number>>();
    for (const [tanggal, list] of eventPerTanggal) {
      const hitung = map.get(tanggal) ?? new Map<JenisPermohonan, number>();
      for (const event of list) {
        hitung.set(event.jenis, (hitung.get(event.jenis) ?? 0) + 1);
      }
      map.set(tanggal, hitung);
    }
    return map;
  }, [eventPerTanggal]);

  /**
   * Baris yang benar-benar digambar.
   *
   * Baris pertama dan terakhir yang kosong semua disembunyikan. Tanggal di
   * dalamnya tidak punya isi apa pun, jadi yang tersisa cuma 74px ruang kosong
   * di tiap sisi grid dan kalender kelihatan melompong. Baris kosong di tengah
   * tetap digambar supaya jarak antar tanggal tidak berubah saat mata
   * menyisir baris.
   *
   * Kalau satu bulan tidak punya pengajuan sama sekali, tidak ada baris yang
   * bisa dipangkas dan gridnya tetap utuh: itu informasi yang berguna, bukan
   * ruang sia-sia.
   */
  const barisTerpakai = useMemo(() => {
    const ada = (baris: (typeof grid)[number]) =>
      baris.some((sel) => (eventPerTanggal.get(sel.key) ?? []).length > 0);

    let awal = 0;
    let akhir = grid.length - 1;
    while (awal <= akhir && !ada(grid[awal])) awal += 1;
    while (akhir >= awal && !ada(grid[akhir])) akhir -= 1;

    if (awal > akhir) return grid;
    return grid.slice(awal, akhir + 1);
  }, [grid, eventPerTanggal]);

  const tutupModal = useCallback(() => setHariDipilih(null), []);
  useModalDismiss(hariDipilih !== null, tutupModal);

  // Fokuskan tombol tutup begitu modal muncul. Dua modal admin belum melakukan
  // ini, tapi di kalender tombol yang fokus bisa justru berada di dalam grid di
  // belakang overlay, jadi penutupnya yang dikembalikan fokus.
  const tombolTutupRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (hariDipilih !== null) tombolTutupRef.current?.focus();
  }, [hariDipilih]);

  // Bulan pertama sudah ada di prop, jadi effect ini tidak pernah memanggil
  // jaringan untuk render pertama.
  //
  // Tiga hal yang disimpan di sini karena semuanya harus bertahan di antara
  // render, bukan ikut state:
  //   bulanAwalRef      bulan render pertama, isinya sudah jadi prop
  //   bulanTerakhirRef  bulan yang datanya utuh, dipakai untuk kembali saat gagal
  //   cacheRef          isi tiap bulan yang sudah pernah dimuat
  //
  // Tanpa cache, memindah bulan lalu menekan "Bulan ini" akan kembali ke bulan
  // awal tanpa meminta ulang, dan grid akan menampilkan event bulan yang
  // baru saja ditinggalkan di bawah tanggal bulan awal.
  const cacheRef = useRef(new Map<string, EventKalender[]>([[bulan, events]]));
  const bulanAwalRef = useRef(bulan);
  const bulanTerakhirRef = useRef(bulan);
  useEffect(() => {
    // Sudah punya datanya: render pertama, atau bulan yang sama yang dipintau
    // lagi. Tanpa cabang ini, memindah bulan lalu kembali lagi akan meminta
    // ulang bulan pertama, padahal isinya sudah ada.
    if (bulan === bulanAwalRef.current || bulan === bulanTerakhirRef.current) {
      setEventsBulan(cacheRef.current.get(bulan) ?? []);
      setMemuat(false);
      return;
    }

    const controller = new AbortController();
    setMemuat(true);
    setGalat(null);

    fetch(`/api/kalender?bulan=${bulan.slice(0, 7)}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (data.aktif === false) {
          throw new Error("Kalender sedang tidak ditampilkan.");
        }
        if (!res.ok || !Array.isArray(data.events)) {
          throw new Error(typeof data.galat === "string" ? data.galat : "Gagal memuat bulan ini.");
        }
        bulanTerakhirRef.current = bulan;
        cacheRef.current.set(bulan, data.events);
        setEventsBulan(data.events);
        setMemuat(false);
      })
      .catch((error: unknown) => {
        // Klik bulan lalu klik lagi dengan cepat akan membatalkan permintaan
        // yang pertama. Itu bukan galat, jadi jangan sampai ditampilkan.
        if (error instanceof Error && error.name === "AbortError") return;
        // Kembalikan ke bulan yang datanya masih utuh, supaya grid tidak
        // menampilkan tanggal bulan baru yang isinya milik bulan lama.
        setGalat(error instanceof Error ? error.message : "Gagal memuat bulan ini.");
        setBulan(bulanTerakhirRef.current);
        setMemuat(false);
      });

    return () => controller.abort();
  }, [bulan]);

  // Rincian hari yang sedang terbuka harus ikut tertutup kalau bulan berganti,
  // karena tanggal yang dikeklik tidak ada lagi di layar.
  useEffect(() => {
    setHariDipilih(null);
  }, [bulan]);

  function toggleJenis(jenis: JenisPermohonan) {
    setJenisAktif((sebelumnya) => {
      if (!sebelumnya.includes(jenis)) {
        return JENIS_OPTIONS.filter((item) => item === jenis || sebelumnya.includes(item));
      }
      // Minimal satu jenis harus menyala, jadi jenis terakhir tidak boleh
      // dimatikan dan grid tidak pernah tampil kosong karena filter.
      if (sebelumnya.length === 1) return sebelumnya;
      return sebelumnya.filter((item) => item !== jenis);
    });
  }

  const eventHariTerpilih = hariDipilih ? (eventPerTanggal.get(hariDipilih) ?? []) : [];
  const jumlahEvent = eventHariTerpilih.length;

  // Batas tombol mengikuti MAKS_GESER_BULAN yang sama dengan route, jadi tombol
  // yang masih aktif selalu berarti permintaan yang dijawab server.
  const bisaSebelumnya = geser > -MAKS_GESER_BULAN;
  const bisaBerikutnya = geser < MAKS_GESER_BULAN;

  // Bentuk functional dipakai supaya bulan dihitung dari state terbaru. Kalau
  // `bulan` dibaca langsung dari closure, beberapa klik dalam satu frame akan
  // semuanya menghitung dari bulan yang sama dan menggeser hanya satu langkah.
  function geserBulanIni(jumlah: number) {
    setBulan((sebelumnya) => kunciBulan(geserBulan(tanggalDariKey(sebelumnya), jumlah)));
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-line/70 px-3 py-2 sm:px-4">
        <button
          aria-label="Bulan sebelumnya"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-slate-500 transition-colors duration-150 hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          disabled={!bisaSebelumnya}
          onClick={() => geserBulanIni(-1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3
          aria-live="polite"
          className="min-w-0 flex-1 truncate px-1 text-sm font-bold tracking-tight text-ink"
        >
          {judulBulan(anchorTanggal)}
        </h3>
        <button
          aria-label="Bulan berikutnya"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-slate-500 transition-colors duration-150 hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          disabled={!bisaBerikutnya}
          onClick={() => geserBulanIni(1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {bulan !== bulanIni ? (
          <button
            className="ml-1 shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-white hover:text-ink"
            onClick={() => setBulan(bulanIni)}
            type="button"
          >
            Bulan ini
          </button>
        ) : null}
      </div>

      {galat !== null ? (
        <div
          className="border-b border-line/70 bg-rose-50 px-4 py-2 text-xs text-rose-700 sm:px-6"
          role="alert"
        >
          {galat}
        </div>
      ) : null}

      <div className="border-b border-line/70 px-4 py-2.5 sm:px-6" role="group" aria-label="Saring jenis pengajuan">
        <div className="flex flex-wrap gap-1.5">
          {JENIS_OPTIONS.map((jenis) => {
            const aktif = jenisAktif.includes(jenis);
            const terkunci = aktif && jenisAktif.length === 1;
            const gaya = JENIS_KALENDER[jenis];
            return (
              <button
                key={jenis}
                aria-pressed={aktif}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                  aktif ? gaya.chipClass : "border-line bg-white/70 text-slate-500"
                } ${terkunci ? "cursor-not-allowed opacity-60" : ""}`}
                onClick={() => toggleJenis(jenis)}
                title={terkunci ? "Minimal satu jenis harus aktif" : undefined}
                type="button"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${aktif ? gaya.dotClass : "bg-slate-300"}`}
                />
                {gaya.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-busy={memuat}
        className={`px-2 pb-2 pt-2.5 transition-opacity duration-150 sm:px-3 ${
          memuat ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="grid grid-cols-7 border-b border-line/70 pb-1.5">
          {HARI_MINGGU.map((hari) => (
            <div
              className={`text-center text-[10px] font-semibold uppercase tracking-wide ${
                hari === "Min" ? "text-slate-400" : "text-slate-500"
              }`}
              key={hari}
            >
              {hari}
            </div>
          ))}
        </div>

        <div className="mt-1 flex flex-col gap-1">
          {barisTerpakai.map((baris) => (
            <div className="grid flex-1 grid-cols-7 gap-1" key={`baris-${baris[0].key}`}>
              {baris.map((sel) => {
                const list = eventPerTanggal.get(sel.key) ?? [];
                const kosong = list.length === 0;
                const jumlah = list.length;
                const hitungan = jumlahPerJenis.get(sel.key);

                // Jenis yang punya pengajuan hari ini, urutannya mengikuti
                // PETAK: (0,0) lalu (0,1) lalu (1,0) lalu (1,1), dan yang
                // kosong dilewati. Daftar ini yang mengisi kedua bentuk
                // petak, jadi ponsel dan layar luas tidak bisa berbeda.
                const isi = PETAK.flat().flatMap((jenis) => {
                  const n = hitungan?.get(jenis) ?? 0;
                  return n > 0 ? [{ jenis, n }] : [];
                });

                // Ringkasan per jenis untuk pembaca layar: "Liputan 2, Collab 1".
                // Hitungan di sel hanya dibaca mata, jadi tanpa ini informasi
                // jenis dan jumlahnya hilang untuk pengguna screen reader.
                const ringkas = isi.map(({ jenis, n }) => `${JENIS_KALENDER[jenis].label} ${n}`);

                return (
                  <button
                    aria-label={`${formatTanggal(tanggalDariKey(sel.key))}${
                      kosong ? ", tanpa pengajuan" : `, ${jumlah} pengajuan: ${ringkas.join(", ")}`
                    }`}
                    className={`flex h-[70px] flex-col overflow-hidden rounded-lg border p-1 text-left transition-colors duration-150 ${
                      kosong
                        ? "cursor-default border-transparent bg-transparent"
                        : "cursor-pointer border-line/70 bg-white/80 hover:border-brand/50 hover:bg-white"
                    } ${
                      // Sel bulan lain diredupkan hanya kalau kosong. Kalau
                      // berisi pengajuan, petaknya harus tetap terbaca: acara
                      // bulan depan tetap acara yang dicari.
                      !sel.bulanIni && kosong ? "opacity-40" : ""
                    }`}
                    disabled={kosong}
                    key={sel.key}
                    onClick={() => setHariDipilih(sel.key)}
                    type="button"
                  >
                    <span
                      className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[11px] font-semibold leading-4 ${
                        sel.key === today
                          ? "bg-brand text-white"
                          : sel.bulanIni
                            ? "text-slate-600"
                            : "text-slate-400"
                      }`}
                    >
                      {sel.tanggal.getDate()}
                    </span>

                    {kosong ? null : (
                      <>
                        {/* Ponsel: petak 2x2 warna saja. Layar lebar: petak
                            2x2 yang sama tapi teks jenisnya ikut terbaca.
                            Dua-duanya di DOM, breakpoint yang memilih, jadi
                            tidak ada JS yang tahu ukuran layar dan tidak ada
                            selisih render server vs klien. Keduanya memakai
                            daftar isi yang sama, jadi urutan dan posisi petak
                            tidak mungkin berbeda antara ponsel dan desktop. */}
                        <div
                          aria-hidden="true"
                          className="mt-1 grid w-fit grid-cols-2 gap-0.5 lg:hidden"
                        >
                          {isi.map(({ jenis, n }) => (
                            <span
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] text-[9px] font-bold leading-none text-white ${JENIS_KALENDER[jenis].petakClass}`}
                              key={jenis}
                              title={`${JENIS_KALENDER[jenis].label}: ${n}`}
                            >
                              {/* Angka hanya muncul kalau lebih dari satu. Satu
                                  petak penuh tanpa angka sudah terbaca "ada
                                  satu", jadi menulis "1" di mana-mana cuma
                                  menambah noise. */}
                              {n > 1 ? n : null}
                            </span>
                          ))}
                        </div>

                        <div aria-hidden="true" className="mt-1 hidden w-full grid-cols-2 gap-0.5 lg:grid">
                          {isi.map(({ jenis, n }) => {
                            const gaya = JENIS_KALENDER[jenis];

                            return (
                              <span
                                className={`flex h-4 min-w-0 items-center justify-center truncate rounded px-1 text-[10px] font-medium leading-4 text-white ${gaya.petakClass}`}
                                key={jenis}
                                title={`${gaya.label}: ${n}`}
                              >
                                {gaya.label}
                                {n > 1 ? ` ${n}` : null}
                              </span>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line/70 px-4 py-2.5 text-[11px] text-slate-500 sm:px-6">
        {JENIS_OPTIONS.map((jenis) => (
          <span className="inline-flex items-center gap-1.5" key={jenis}>
            {/* Kunci warna untuk kedua tampilan: di ponsel bentuknya sama
                dengan petak di sel, di layar lebar selnya memakai badge
                bertulisan tapi warnanya sama. */}
            <span className={`h-2 w-2 rounded-[2px] ${JENIS_KALENDER[jenis].petakClass}`} />
            {JENIS_KALENDER[jenis].label}
          </span>
        ))}
        <span className="ml-auto">Klik satu hari untuk melihat rinciannya.</span>
      </div>

      {/* Modal dirender lewat portal ke document.body, bukan tetap di dalam
          kartu kalender ini.

          Alasannya `position: fixed` tidak selalu dihitung terhadap
          viewport: begitu sebuah leluhur punya `backdrop-filter`, `filter`,
          `transform`, `perspective`, atau `contain`, elemen itu menjadi
          containing block untuk seluruh keturunan `fixed`-nya. Di sini ada
          dua leluhur yang menyediakannya, keduanya di dalam subtree yang sama:
            1. akar komponen ini sendiri, `card overflow-hidden`, dan
               `backdrop-filter: blur(20px)`-nya membuat `inset-0` hanya
               menutup kartu kalender, bukan layar.
            2. pembungkus `data-reveal` di app/page.tsx, yang GSAP gerakkan
               dengan `y` dan tidak pernah `clearProps`, jadi `transform`-nya
               masih tertinggal setelah animasi selesai.

          Akibatnya overlay lama terpusat di dalam kartu kalender, bukan di
          tengah jendela, dan `overflow-hidden` sempat memotongnya. Klik di
          luar kartu pun tidak pernah sampai ke penangan onClick, jadi
          "tutup saat klik di luar" praktis tidak pernah menyala.

          Portal memutus seluruh rantai itu sekaligus: satu anak dari
          document.body tidak punya leluhur yang bisa jadi containing block,
          apa pun yang terjadi pada transform atau filter di halaman.

          Aman saat render server: `hariDipilih` hanya bisa terisi dari
          onClick sel tanggal, jadi di server dan di hidrasi pertama
          nilainya null dan portal ini tidak pernah dijalankan di sana. */}
      {hariDipilih !== null
        ? createPortal(
            <div
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
              onClick={(event) => {
                if (event.target === event.currentTarget) tutupModal();
              }}
              role="dialog"
            >
              <div className="card my-auto w-full max-w-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-line/70 px-6 py-5">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-ink">
                      {formatTanggal(tanggalDariKey(hariDipilih))}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {jumlahEvent === 0 ? "Tidak ada pengajuan." : `${jumlahEvent} pengajuan.`}
                    </p>
                  </div>
                  <button
                    aria-label="Tutup"
                    className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
                    onClick={tutupModal}
                    ref={tombolTutupRef}
                    type="button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[65vh] space-y-3 overflow-y-auto px-6 py-5">
                  {eventHariTerpilih.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                      Belum ada pengajuan yang disetujui atau selesai pada hari ini.
                    </p>
                  ) : (
                    eventHariTerpilih.map((event) => {
                      const gaya = JENIS_KALENDER[event.jenis];
                      return (
                        <div
                          className="rounded-2xl border border-line/70 bg-white/80 p-4"
                          key={event.key}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold leading-snug text-ink">{event.namaAcara}</p>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${gaya.chipClass}`}
                            >
                              {gaya.label}
                            </span>
                          </div>
                          <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
                            <div className="flex gap-2">
                              <dt className="w-28 shrink-0 text-slate-400">Instansi</dt>
                              <dd className="font-medium">{event.namaInstansi || "-"}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="w-28 shrink-0 text-slate-400">
                                {event.jenis === "peminjaman_podcast" ? "Tanggal pinjam" : "Tanggal"}
                              </dt>
                              <dd className="font-medium">
                                {formatTanggal(tanggalDariKey(event.tanggal))}
                              </dd>
                            </div>
                            {event.tempatAcara ? (
                              <div className="flex gap-2">
                                <dt className="w-28 shrink-0 text-slate-400">Tempat</dt>
                                <dd className="font-medium">{event.tempatAcara}</dd>
                              </div>
                            ) : null}
                            {event.waktu ? (
                              <div className="flex gap-2">
                                <dt className="w-28 shrink-0 text-slate-400">Waktu</dt>
                                <dd className="font-medium">{event.waktu}</dd>
                              </div>
                            ) : null}
                          </dl>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
