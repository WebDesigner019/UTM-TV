"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useModalDismiss } from "@/components/useModalDismiss";
import { HARI_MINGGU, buildGridBulan, tanggalDariKey, type EventKalender } from "@/lib/kalender-grid";
import { JENIS_KALENDER, JENIS_OPTIONS, formatTanggal, type JenisPermohonan } from "@/lib/status";

/** Berapa badge yang masih muat di dalam satu sel sebelum jadi "+X lagi". */
const MAKS_BADGE_PER_SEL = 2;

/**
 * Kalender pengajuan untuk landing page.
 *
 * Data sudah diambil server dan dikirim lewat prop, jadi komponen ini tidak
 * melakukan fetch apa pun: hanya menyaring dan menggambar. Saringan jenis
 * sengaja disimpan di state, bukan di query param, supaya URL landing page
 * tetap bersih dan tidak menambah satu route API lagi.
 *
 * Titik jangkar bulan dikirim sebagai prop "anchor" supaya render di server dan
 * hidrasi di klien menghasilkan grid yang sama persis, termasuk di batas
 * pergantian bulan.
 */
export function KalenderPermohonan({
  events,
  anchor
}: {
  events: EventKalender[];
  /** "YYYY-MM-DD" tanggal server memakai sebagai bulan berjalan. */
  anchor: string;
}) {
  const [jenisAktif, setJenisAktif] = useState<JenisPermohonan[]>([...JENIS_OPTIONS]);
  const [hariDipilih, setHariDipilih] = useState<string | null>(null);

  const anchorTanggal = useMemo(() => tanggalDariKey(anchor), [anchor]);

  const grid = useMemo(() => buildGridBulan(anchorTanggal), [anchorTanggal]);

  const eventPerTanggal = useMemo(() => {
    const map = new Map<string, EventKalender[]>();
    for (const event of events) {
      if (!jenisAktif.includes(event.jenis)) continue;
      const list = map.get(event.tanggal);
      if (list) list.push(event);
      else map.set(event.tanggal, [event]);
    }
    return map;
  }, [events, jenisAktif]);

  const tutupModal = useCallback(() => setHariDipilih(null), []);
  useModalDismiss(hariDipilih !== null, tutupModal);

  // Fokuskan tombol tutup begitu modal muncul. Dua modal admin belum melakukan
  // ini, tapi di kalender tombol yang fokus bisa justru berada di dalam grid di
  // belakang overlay, jadi penutupnya yang dikembalikan fokus.
  const tombolTutupRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (hariDipilih !== null) tombolTutupRef.current?.focus();
  }, [hariDipilih]);

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

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line/70 px-5 py-4 sm:px-7" role="group" aria-label="Saring jenis pengajuan">
        <div className="flex flex-wrap gap-2">
          {JENIS_OPTIONS.map((jenis) => {
            const aktif = jenisAktif.includes(jenis);
            const terkunci = aktif && jenisAktif.length === 1;
            const gaya = JENIS_KALENDER[jenis];
            return (
              <button
                key={jenis}
                aria-pressed={aktif}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  aktif ? gaya.chipClass : "border-line bg-white/70 text-slate-500"
                } ${terkunci ? "cursor-not-allowed opacity-60" : ""}`}
                onClick={() => toggleJenis(jenis)}
                title={terkunci ? "Minimal satu jenis harus aktif" : undefined}
                type="button"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${aktif ? gaya.dotClass : "bg-slate-300"}`}
                />
                {gaya.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 pb-3 pt-4 sm:px-5 sm:pb-5">
        <div className="grid grid-cols-7 border-b border-line/70 pb-2">
          {HARI_MINGGU.map((hari) => (
            <div
              className={`text-center text-[11px] font-semibold uppercase tracking-wide sm:text-xs ${
                hari === "Min" ? "text-slate-400" : "text-slate-500"
              }`}
              key={hari}
            >
              {hari}
            </div>
          ))}
        </div>

        <div className="mt-1 flex flex-col gap-1">
          {grid.map((baris) => (
            <div className="grid flex-1 grid-cols-7 gap-1" key={`baris-${baris[0].key}`}>
              {baris.map((sel) => {
                const list = eventPerTanggal.get(sel.key) ?? [];
                const kosong = list.length === 0;
                const jumlah = list.length;

                return (
                  <button
                    aria-label={`${formatTanggal(tanggalDariKey(sel.key))}${
                      kosong ? ", tanpa pengajuan" : `, ${jumlah} pengajuan`
                    }`}
                    className={`min-h-[68px] rounded-lg border p-1 text-left align-top transition-colors duration-150 sm:min-h-[92px] sm:p-1.5 ${
                      kosong
                        ? "cursor-default border-transparent bg-transparent"
                        : "cursor-pointer border-line/70 bg-white/80 hover:border-brand/50 hover:bg-white"
                    } ${
                      // Sel bulan lain diredupkan hanya kalau kosong. Kalau
                      // berisi pengajuan, badge-nya harus tetap terbaca: acara
                      // bulan depan tetap acara yang dicari.
                      !sel.bulanIni && kosong ? "opacity-40" : ""
                    }`}
                    disabled={kosong}
                    key={sel.key}
                    onClick={() => setHariDipilih(sel.key)}
                    type="button"
                  >
                    <span
                      className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-semibold ${
                        sel.key === anchor
                          ? "bg-brand text-white"
                          : sel.bulanIni
                            ? "text-slate-600"
                            : "text-slate-400"
                      }`}
                    >
                      {sel.tanggal.getDate()}
                    </span>

                    {kosong ? null : (
                      <div className="mt-1 flex flex-col gap-1">
                        {list.slice(0, MAKS_BADGE_PER_SEL).map((event) => (
                          <span
                            className={`block truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-4 ${JENIS_KALENDER[event.jenis].badgeClass}`}
                            key={event.key}
                            title={event.namaAcara}
                          >
                            {JENIS_KALENDER[event.jenis].label}
                          </span>
                        ))}
                        {jumlah > MAKS_BADGE_PER_SEL ? (
                          <span className="block px-1.5 text-[10px] font-semibold leading-4 text-slate-500">
                            +{jumlah - MAKS_BADGE_PER_SEL} lagi
                          </span>
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/70 px-5 py-4 text-xs text-slate-500 sm:px-7">
        {JENIS_OPTIONS.map((jenis) => (
          <span className="inline-flex items-center gap-1.5" key={jenis}>
            <span className={`h-2.5 w-2.5 rounded-full ${JENIS_KALENDER[jenis].dotClass}`} />
            {JENIS_KALENDER[jenis].label}
          </span>
        ))}
        <span className="ml-auto">Klik satu hari untuk melihat rinciannya.</span>
      </div>

      {hariDipilih !== null ? (
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
                      </dl>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
