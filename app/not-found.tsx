import Link from "next/link";

/**
 * Halaman untuk URL yang tidak dikenal.
 *
 * Aplikasi tanpa file ini akan memakai halaman 404 bawaan Next yang berbahasa Inggris
 * dan tanpa navigasi, sehingga pengunjung yang salah mengetik URL mendarat di
 * halaman yang terlihat seperti halaman rusak.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 sm:py-12">
      <div className="card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          COMPACT
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          Alamat yang Anda buka tidak tersedia. Mungkin ada salah ketik, atau
          halamannya sudah dipindahkan.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            Ke Beranda
          </Link>
          <Link href="/lacak" className="btn-secondary">
            Cek Status Permohonan
          </Link>
        </div>
      </div>
    </main>
  );
}