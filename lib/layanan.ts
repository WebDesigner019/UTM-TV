import type { JenisPermohonan } from "@/lib/status";

/**
 * Isi prosedur dan ketentuan tiap layanan COMPACT UTM TV.
 *
 * Teks ini ditampilkan di modal "Pelajari Layanan" pada halaman depan, jadi
 * pemohon bisa membaca aturan pengajuan sebelum mengisi formulir. Isinya
 * masih bisa diubah dari satu tempat di sini, bukan dari tiap tombol.
 */
export type Layanan = {
  jenis: JenisPermohonan;
  /** Label tombol di kartu peringatan. */
  tombol: string;
  /** Judul modal. */
  judul: string;
  /** Bagian A. */
  deskripsi: string;
  /** Bagian B, tampil sebagai daftar berurutan. */
  prosedur: string[];
  /** Bagian C, tampil sebagai daftar berurutan. */
  ketentuan: string[];
};

export const LAYANAN: Layanan[] = [
  {
    jenis: "liputan",
    tombol: "Liputan",
    judul: "PENGAJUAN LIPUTAN",
    deskripsi:
      "Permohonan Liputan adalah layanan untuk mengajukan peliputan kegiatan atau event oleh UTM TV, dalam bentuk liputan berita dan dipublikasi melalui media UTM TV.",
    prosedur: [
      'Pemohon mengakses Sistem COMPACT UTM TV dan memilih layanan "Pengajuan Liputan" pada sistem.',
      "Pemohon mengisi dan mengirimkan formulir pengajuan sesuai kebutuhan kegiatan.",
      "Tim Kerja Sama UTM TV melakukan verifikasi terhadap data dan kelengkapan pengajuan.",
      "Pemohon melakukan konfirmasi kepada Tim Kerja Sama UTM TV melalui kontak yang tersedia.",
      "UTM TV dan pemohon melakukan koordinasi serta persetujuan kerja sama."
    ],
    ketentuan: [
      "Pengajuan Liputan kepada UTM TV berarti pihak penyelenggara bersedia menjalin hubungan kerja sama yang saling mendukung dalam publikasi kegiatan.",
      "Penyelenggara kegiatan harus berasal dari sivitas akademika Universitas Trunojoyo Madura, termasuk mahasiswa, organisasi mahasiswa, lembaga, UKM, himpunan, fakultas, dan unit kerja di UTM.",
      "Penyelenggara mengirimkan surat permohonan maksimal H-7 acara dengan melampirkan rundown kegiatan.",
      "Setiap permohonan akan melalui proses seleksi dan peninjauan, dengan prioritas diberikan kepada kegiatan yang diselenggarakan oleh Universitas."
    ]
  },
  {
    jenis: "media_partner",
    tombol: "Media Partner",
    judul: "PENGAJUAN MEDIA PARTNER",
    deskripsi:
      "Media Partner merupakan layanan kerja sama UTM TV dengan penyelenggara kegiatan untuk mendukung promosi dan publikasi kegiatan melalui media sosial resmi UTM TV, khususnya Instagram.",
    prosedur: [
      'Pemohon mengakses Sistem COMPACT UTM TV dan memilih layanan "Pengajuan Media Partner" pada sistem.',
      "Pemohon mengisi dan mengirimkan formulir pengajuan sesuai kebutuhan kegiatan.",
      "Tim Kerja Sama UTM TV melakukan verifikasi terhadap data dan kelengkapan pengajuan.",
      "Pemohon melakukan konfirmasi kepada Tim Kerja Sama UTM TV melalui kontak yang tersedia.",
      "UTM TV dan pemohon melakukan koordinasi serta persetujuan kerja sama dengan melakukan verifikasi seluruh persyaratan.",
      "Pemohon mengirimkan materi publikasi maksimal H-3 sebelum tanggal publikasi.",
      "UTM TV melakukan penyesuaian materi dan publikasi sesuai jadwal yang telah disepakati."
    ],
    ketentuan: [
      "Pengajuan Media Partner merupakan bentuk kerja sama publikasi antara UTM TV dan penyelenggara kegiatan.",
      "Penyelenggara kegiatan merupakan sivitas akademika Universitas Trunojoyo Madura, meliputi mahasiswa, organisasi mahasiswa, lembaga, UKM, himpunan, fakultas, maupun unit kerja di lingkungan UTM.",
      "Pemohon wajib mengikuti seluruh media sosial resmi UTM TV dengan minimal 20 akun aktif.",
      "Materi publikasi wajib mencantumkan logo UTM TV pada pamflet atau media publikasi.",
      "Materi publikasi wajib dikirimkan kepada UTM TV maksimal H-3 sebelum tanggal publikasi.",
      "Masa publikasi Media Partner adalah maksimal 15 hari.",
      "Media Partner dipublikasikan melalui Instagram resmi UTM TV.",
      "Pelaksanaan publikasi menunggu persetujuan dan konfirmasi dari Tim Kerja Sama UTM TV.",
      "UTM TV berhak menolak atau meminta perbaikan pengajuan apabila tidak memenuhi ketentuan atau kelengkapan yang ditetapkan."
    ]
  },
  {
    jenis: "kerjasama",
    tombol: "Kerja Sama",
    judul: "PENGAJUAN KERJASAMA",
    deskripsi:
      "Layanan Kerjasama adalah layanan pengajuan berbagai bentuk kerja sama dengan UTM TV, seperti kolaborasi konten, podcast, publikasi, maupun bentuk kerja sama media lainnya.",
    prosedur: [
      'Pemohon mengakses Sistem COMPACT UTM TV dan memilih layanan "Pengajuan Kerjasama" pada sistem.',
      "Pemohon mengisi dan mengirimkan formulir pengajuan sesuai kebutuhan kegiatan.",
      "Tim Kerja Sama UTM TV melakukan verifikasi terhadap data dan kelengkapan pengajuan.",
      "Pemohon melakukan konfirmasi kepada Tim Kerja Sama UTM TV melalui kontak yang tersedia.",
      "UTM TV dan pemohon melakukan koordinasi serta persetujuan kerja sama."
    ],
    ketentuan: [
      "Pengajuan kerja sama kepada UTM TV berarti pihak pemohon bersedia menjalin hubungan kerja sama yang saling menguntungkan dan sesuai ketentuan yang berlaku.",
      "Bentuk kerja sama dapat berupa kolaborasi konten, podcast, publikasi, produksi video, maupun bentuk kerja sama media lainnya.",
      "Pemohon wajib menyampaikan konsep, tujuan, bentuk kerja sama, waktu pelaksanaan, dan kebutuhan kerja sama secara jelas untuk memudahkan proses koordinasi.",
      "Pengajuan kerja sama disampaikan maksimal H-3 sebelum pelaksanaan kegiatan atau waktu publikasi untuk proses penyesuaian jadwal dan kebutuhan produksi.",
      "Setiap bentuk kerja sama akan melalui proses koordinasi dan persetujuan UTM TV dengan mempertimbangkan kesesuaian konten, jadwal, sumber daya, dan kebijakan redaksi."
    ]
  },
  {
    jenis: "peminjaman_podcast",
    tombol: "Ruang Podcast",
    judul: "PENGAJUAN PEMINJAMAN RUANG PODCAST",
    deskripsi:
      "Peminjaman Ruang Podcast merupakan layanan yang menyediakan fasilitas Ruang Podcast untuk mendukung kegiatan produksi podcast, wawancara, diskusi, dan konten audiovisual bagi sivitas akademika Universitas Trunojoyo Madura.",
    prosedur: [
      "Pemohon melakukan permohonan peminjaman ruangan ke BAKK (P. Hofid BAKK) dengan membawa Surat Permohonan Peminjaman Ruang Podcast yang ditujukan kepada Kepala BAKK UTM. Surat tersebut dilengkapi rundown dan detail kegiatan, serta tanda tangan Pembina, Koordinator Program Studi, Dekan, atau Kepala Unit terkait pengajuan (minimal H-7 sebelum digunakan).",
      "Pihak BAKK akan melakukan persetujuan dan perjanjian dengan pemohon.",
      'Jika disetujui BAKK, pemohon mengakses Sistem COMPACT UTM TV dan memilih layanan "Peminjaman Ruang Podcast" pada sistem.',
      "Pemohon mengisi dan mengirimkan formulir pengajuan sesuai kebutuhan kegiatan.",
      "Tim Kerja Sama UTM TV melakukan verifikasi terhadap data dan kelengkapan pengajuan.",
      "Pemohon melakukan konfirmasi kepada Tim Kerja Sama UTM TV melalui kontak yang tersedia.",
      "UTM TV dan pemohon melakukan koordinasi serta persetujuan kerja sama."
    ],
    ketentuan: [
      "Pengajuan peminjaman Ruang Podcast menunjukkan komitmen pemohon untuk menjaga kebersihan, keamanan, dan ketertiban ruangan. Pemohon bertanggung jawab atas fasilitas dan peralatan, serta atas kerusakan atau kehilangan selama pemakaian.",
      "Pemohon wajib mematuhi semua yang tertulis pada Surat Pernyataan dan Perjanjian yang sudah dibuat dengan Pihak BAKK UTM.",
      "Penyelenggara kegiatan harus berasal dari sivitas akademika Universitas Trunojoyo Madura, termasuk mahasiswa, organisasi mahasiswa, lembaga, UKM, himpunan, fakultas, dan unit kerja di UTM.",
      "Setiap permohonan akan diseleksi oleh tim UTM TV, sekaligus berhak membatalkan atau menjadwal ulang jika ada kegiatan internal atau prioritas universitas."
    ]
  }
];
