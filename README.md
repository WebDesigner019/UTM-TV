# Sistem Pengajuan Liputan UTM TV

Website full stack untuk pengajuan dan pelacakan permohonan liputan acara kampus UTM TV. Pemohon publik dapat mengirim formulir tanpa login, sedangkan admin wajib login untuk mengelola status dan riwayat permohonan.

## Stack

Proyek ini memakai Next.js 14 App Router, Prisma, MySQL, Tailwind CSS, JWT cookie untuk admin, upload file ke disk lokal, dan Nodemailer untuk email transaksional. Stack ini dipilih agar aplikasi tetap portable dan tidak bergantung pada vendor hosting tertentu.

## Fitur

- Landing page berbahasa Indonesia dengan CTA pengajuan dan cek status.
- Form pengajuan publik dengan upload surat.
- Validasi email kampus: `@student.trunojoyo.ac.id` dan `@trunojoyo.ac.id`.
- Nomor rujukan otomatis: `UTMTV-TAHUN-0001`.
- Halaman lacak memakai nomor rujukan + email.
- Login admin, dashboard, filter, statistik per status.
- Input manual oleh admin lewat tombol "Tambah Data" untuk keempat jenis permohonan, memakai form yang sama dengan form publik.
- Lupa password admin dan pembuatan password baru melalui tautan reset.
- Detail permohonan, unduh file, ubah status, pesan pemohon, catatan internal.
- Ubah data permohonan lewat tombol "Ubah Data" pada halaman detail, memakai form yang sama dengan form publik. Status, pesan pemohon, dan catatan internal tetap diubah lewat form status, dan nomor rujukan tidak pernah berubah.
- Pergantian lampiran saat ubah data: lampiran baru opsional, berkas lama dihapus setelah penyimpanan berhasil, dan berkas baru ikut dibersihkan kalau penyimpanan gagal.
- Setiap perubahan data tercatat di `status_history` dengan status lama dan baru yang sama, sehingga riwayat perubahan data terlihat di timeline tanpa tabel baru.
- Semua perubahan status tercatat di `status_history`.
- Email konfirmasi, email perubahan status, dan email perubahan data. Email perubahan data memuat daftar field yang berubah beserta nilai lama dan barunya. Jika SMTP belum diatur, email dicatat ke console.
- Data yang dicatat manual ditandai `input_manually_entered` dan tidak pernah memicu email atau notifikasi WhatsApp, karena tidak ada email maupun nomor WhatsApp yang dikumpulkan. Kolom kontak juga tidak dibuka pada form ubah data untuk record seperti ini.
- Notifikasi perubahan data dikirim lewat email dan WhatsApp, hanya bila ada field yang benar-benar berubah, dan bisa dimatikan lewat checkbox "Kirim notifikasi ke pemohon".
- Hapus permohonan lewat tombol "Hapus Data" pada halaman detail, dengan dialog konfirmasi yang meminta admin mengetik HAPUS. Penghapusan bersifat permanen: record, riwayat status, dan berkas lampiran ikut terhapus, sehingga tidak ada jalur pembatalan di dalam aplikasi.
- Rate limiting sederhana untuk submit, lacak, dan login.

## Persyaratan

- Node.js 20+
- MySQL 8+
- npm

## Menjalankan Lokal

1. Instal dependensi:

```bash
npm install
```

2. Salin env contoh:

```bash
cp .env.example .env
```

3. Isi nilai penting di `.env`:

```env
DATABASE_URL="mysql://user:pass@localhost:3306/utm_tv_liputan"
JWT_SECRET="rahasia-panjang"
SESSION_SECRET="rahasia-cookie"
ADMIN_SEED_EMAIL="tv@trunojoyo.ac.id"
ADMIN_SEED_PASSWORD="password-admin-yang-aman"
```

4. Jalankan migration dan seed:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Opsional: isi data contoh untuk mencoba dashboard, kalender, dan filter:

```bash
npm run db:seed:dummy                 # 24 record contoh, semua di bulan berjalan
npm run db:seed:dummy -- --jumlah 40 # jumlah lain
npm run db:seed:dummy -- --bersihkan # hapus lagi data contoh
```

6. Jalankan aplikasi:

```bash
npm run dev
```

Aplikasi tersedia di `http://localhost:3000`.

## Docker Compose

Untuk lingkungan dev dengan MySQL:

```bash
docker compose up --build
```

Container aplikasi akan berjalan di `http://localhost:3000`, dan MySQL tersedia di port `3306`.

Setelah database siap, jalankan migration dan seed di container app:

```bash
docker compose exec app npm run prisma:deploy
docker compose exec app npm run db:seed
```

## Struktur Penting

- `app/` - halaman UI dan API routes Next.js.
- `components/` - komponen UI bersama. `components/PermohonanForm.tsx` adalah satu-satunya implementasi form pengajuan, dipakai bersama oleh halaman publik, modal input manual admin, dan modal ubah data admin.
- `lib/` - Prisma, auth, email, upload, validasi env, rate limit.
- `lib/permohonan-form.ts` - definisi field per jenis permohonan, dipakai bersama oleh form, skema validasi, dan route. Kolom database tiap field ikut didefinisikan di sini sebagai sumber tunggal untuk prefill form admin, payload update, dan diff notifikasi.
- `lib/permohonan-record.ts` - satu-satunya tempat pemetaan jenis permohonan ke model Prisma dan tabel status history-nya, dipakai bersama oleh route, lib upload, dan halaman detail.
- `lib/permohonan-edit.ts` - alur ubah data permohonan: validasi, payload kolom, penggantian lampiran, dan pencatatan riwayat perubahan.
- `lib/permohonan-delete.ts` - alur hapus permohonan: penghapusan record, kebersihan lampiran, dan batasannya soal jejak audit.
- `lib/permohonan-notify.ts` - pengiriman notifikasi email dan WhatsApp, dipakai bersama oleh perubahan status dan perubahan data.
- `public/assets/` - logo UTM TV, favicon, dan gambar watermark.
- `prisma/schema.prisma` - skema ORM.
- `prisma/migrations/20260520000000_init/migration.sql` - migration SQL MySQL.
- `prisma/seed.ts` - seed admin dari environment variable.
- `scripts/seed-dummy.ts` - data contoh untuk mencoba aplikasi: 24 record di bulan berjalan, tersebar di keempat jenis, lengkap dengan lampiran PDF, riwayat status, dan satu record yang dicatat manual. Setiap record ditandai `[dummy]` pada `catatan_internal`, jadi `npm run db:seed:dummy -- --bersihkan` hanya menghapus data contoh dan tidak pernah menyentuh data asli.
- `uploads/` - direktori upload lokal, tidak masuk git.

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Nilai sensitif seperti password admin, `JWT_SECRET`, dan `SESSION_SECRET` tidak boleh dikomit.

SMTP bersifat opsional. Jika `SMTP_HOST`, `SMTP_PORT`, dan `SMTP_FROM` kosong, aplikasi tetap berjalan dan email dicetak ke console.

## Akun Admin Awal

Akun admin dibuat oleh seed:

- Email: nilai `ADMIN_SEED_EMAIL`
- Password: nilai `ADMIN_SEED_PASSWORD`

Seed akan menolak password kosong atau `change-me`.

## Reset Password Admin

Admin dapat membuka `http://localhost:3000/admin/forgot-password`, memasukkan email admin, lalu menerima tautan reset password. Jika SMTP belum dikonfigurasi, tautan reset dicetak ke console server agar tetap bisa dipakai di lingkungan lokal.

## Batas Upload

Format yang diterima:

- PDF
- DOC
- DOCX
- JPG/JPEG
- PNG

Batas ukuran dikendalikan oleh `MAX_FILE_SIZE_MB`, default 10 MB.

## Catatan Keamanan

- Query database melalui Prisma.
- Password admin di-hash dengan bcrypt.
- Cookie admin `httpOnly`, `sameSite=lax`, dan otomatis `secure` di production.
- Pesan lacak gagal dibuat generik: `Data tidak ditemukan.`
- File upload divalidasi berdasarkan ekstensi dan MIME type.
