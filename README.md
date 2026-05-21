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
- Lupa password admin dan pembuatan password baru melalui tautan reset.
- Detail permohonan, unduh file, ubah status, pesan pemohon, catatan internal.
- Semua perubahan status tercatat di `status_history`.
- Email konfirmasi dan email perubahan status. Jika SMTP belum diatur, email dicatat ke console.
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
ADMIN_SEED_EMAIL="admin@trunojoyo.ac.id"
ADMIN_SEED_PASSWORD="password-admin-yang-aman"
```

4. Jalankan migration dan seed:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Jalankan aplikasi:

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
- `components/` - komponen UI bersama.
- `lib/` - Prisma, auth, email, upload, validasi env, rate limit.
- `public/assets/` - logo UTM TV, favicon, dan gambar watermark.
- `prisma/schema.prisma` - skema ORM.
- `prisma/migrations/20260520000000_init/migration.sql` - migration SQL MySQL.
- `prisma/seed.ts` - seed admin dari environment variable.
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
