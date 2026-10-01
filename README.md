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
- Rate limiting untuk submit, lacak, dan login, dengan batas terpisah per-IP dan per-email untuk login.
- Endpoint `/api/health` untuk pemeriksaan kesehatan aplikasi, koneksi database, dan direktori upload.

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
DATABASE_URL="mysql://utmtv:password-database@localhost:3306/utm_tv_liputan"
JWT_SECRET="rahasia-acak-minimal-32-karakter"
ADMIN_SEED_EMAIL="admin@trunojoyo.ac.id"
ADMIN_SEED_PASSWORD="password-admin-yang-aman"
```

`SESSION_SECRET` tidak wajib diisi. Nilainya hanya dipakai sebagai cadangan kalau `JWT_SECRET` kosong.

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

Menjalankan di luar Docker berarti `DATABASE_URL` di `.env` wajib diisi dan MySQL harus sudah jalan di `localhost:3306`. Kalau hanya memakai Docker Compose, `DATABASE_URL` tidak perlu diisi karena compose merakitnya dari `MYSQL_USER` dan `MYSQL_PASSWORD`.

Untuk memeriksa kode sebelum commit:

```bash
npm run check   # lint + typecheck
```

## Deploy ke Server (tanpa Docker)

Jalur deployment utama: Node.js dan MySQL langsung di server, dikelola systemd, dengan nginx sebagai reverse proxy TLS.

Persyaratan: Ubuntu 22.04 atau lebih baru, Node.js 20 LTS, MySQL 8, nginx, domain yang sudah mengarah ke IP server, dan sertifikat TLS.

### 1. MySQL dan user database

Relasinya: aplikasi bicara ke MySQL lewat `DATABASE_URL`, jadi nilainya harus cocok dengan user dan password yang dibuat di langkah ini.

```bash
sudo mysql
```

```sql
CREATE DATABASE utm_tv_liputan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'utmtv'@'localhost' IDENTIFIED BY 'password-database-kuat';
GRANT ALL PRIVILEGES ON utm_tv_liputan.* TO 'utmtv'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Hanya beri hak atas database `utm_tv_liputan`, bukan `ALL PRIVILEGES ON *.*`. Kalau akun ini diretas, kerusakannya berhenti di satu database dan tidak sampai ke MySQL secara keseluruhan.

Batas koneksi bawaan MySQL sudah cukup untuk satu aplikasi, tapi kalau lihat `Too many connections` di log, tambahkan batas khusus lewat `/etc/mysql/mysql.conf.d/utm-tv.cnf`:

```ini
[utmtv]
max_connections = 50
```

### 2. Menyiapkan berkas aplikasi

```bash
sudo useradd --system --create-home --home-dir /srv/utm-tv --shell /usr/sbin/nologin utmtv
sudo -u utmtv git clone <url-repo> /srv/utm-tv/app
cd /srv/utm-tv/app
```

Buat `.env`:

```bash
cp .env.example .env
openssl rand -base64 32   # untuk JWT_SECRET
```

Isi minimal ini:

```env
DATABASE_URL="mysql://utmtv:password-database-kuat@localhost:3306/utm_tv_liputan"
JWT_SECRET="<hasil openssl di atas>"
APP_URL="https://tv.trunojoyo.ac.id"
UPLOAD_DIR="/srv/utm-tv/uploads"
TRUSTED_PROXY_HOPS="1"
MAX_FILE_SIZE_MB="10"
```

`TRUSTED_PROXY_HOPS="1"` karena ada satu nginx di depan aplikasi. Lihat catatan di bagian [Reverse proxy](#3-reverse-proxy-dengan-tls).

Kunci `.env` supaya tidak terbaca user lain dan tidak ikut ter-backup ke tempat yang tidakDiamankan:

```bash
chmod 600 /srv/utm-tv/app/.env
sudo -u utmtv mkdir -p /srv/utm-tv/uploads
```

Buat admin pertama setelah migration dan build selesai, ada di langkah 4.

### 3. Reverse proxy dengan TLS

Contoh nginx:

```nginx
server {
    listen 80;
    server_name tv.trunojoyo.ac.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tv.trunojoyo.ac.id;

    ssl_certificate     /etc/letsencrypt/live/tv.trunojoyo.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tv.trunojoyo.ac.id/privkey.pem;

    # Harus lebih besar dari MAX_FILE_SIZE_MB, karena nginx menolak request
    # sebelum aplikasi sempat membaca dan tidak bisa menampilkan pesan sendiri.
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Unggahan besar perlu waktu lebih dari default 60 detik.
        proxy_read_timeout 120s;
    }
}
```

Aktifkan lalu cek konfigurasi sebelum reload. `nginx -t` yang gagal reload bisa membuat nginx lama ikut mati kalau tidak dicek:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

`proxy_add_x_forwarded_for` menambahkan IP asli ke header. Aplikasi membacanya hanya sebanyak `TRUSTED_PROXY_HOPS`. Kalau nilainya tetap `0`, seluruh pengunjung terlihat berasal dari satu alamat dan rate limit ikut menolak orang yang tidak bersalah. Kalau lebih besar dari jumlah proxy sebenarnya, penyerang bisa memakai IP palsu untuk melewati rate limit.

Aplikasi hanya mendengarkan di `127.0.0.1` karena `npm start` memakai bawaan Next yang mendengarkan di semua interface. Kalau port 3000 terbuka ke internet, orang bisa melewati TLS dan mengabaikan header yang diset nginx.

### 4. Build, migration, dan systemd

Build butuh `devDependencies`, jadi jalankan sebelum production dependencies dipangkas:

```bash
cd /srv/utm-tv/app
sudo -u utmtv npm ci
sudo -u utmtv npm run check
sudo -u utmtv npm run build
```

Terapkan migration, lalu buat admin pertama:

```bash
sudo -u utmtv npm run prisma:deploy
sudo -u utmtv npm run db:seed
```

Seed membaca `ADMIN_SEED_EMAIL` dan `ADMIN_SEED_PASSWORD` dari `.env`. Seed menolak password kosong, `change-me`, dan nilai terlalu pendek. Ganti password admin lewat halaman `/admin` setelah login pertama.

Setelah build selesai, devDependencies bisa dipangkas supaya server tidak membawa tool build:

```bash
sudo -u utmtv npm prune --omit=dev
```

`prisma` ada di devDependencies, jadi `npm run prisma:deploy` harus dijalankan **sebelum** prune. Untuk migration berikutnya di masa depan, jalankan `npm ci` lagi dulu.

Buat service systemd `/etc/systemd/system/utm-tv.service`:

```ini
[Unit]
Description=UTM TV Sistem Pengajuan Liputan
After=network-online.target mysql.service
Wants=network-online.target

[Service]
Type=simple
User=utm-tv
Group=utm-tv
WorkingDirectory=/srv/utm-tv/app
EnvironmentFile=/srv/utm-tv/app/.env
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
KillSignal=SIGTERM
# Beri waktu menutup koneksi yang sedang dilayani sebelum SIGKILL.
TimeoutStopSec=30

# Pengetatan akses filesystem. Hapus satu per satu kalau aplikasi menolak
# menulis ke lokasi yang tidak disebut di sini.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/utm-tv/app /srv/utm-tv/uploads

StandardOutput=journal
StandardError=journal
SyslogIdentifier=utm-tv

[Install]
WantedBy=multi-user.target
```

`ProtectSystem=strict` membuat filesystem hanya bisa dibaca, jadi direktori upload dan folder aplikasi harus reopened lewat `ReadWritePaths`. Kalau upload gagal dengan `EACCES`, tambahkan path yang relevan di situ.

Jalankan:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now utm-tv
sudo systemctl status utm-tv
```

Cek log:

```bash
sudo journalctl -u utm-tv -f
```

Cek health:

```bash
curl -i http://127.0.0.1:3000/api/health
```

`200` berarti sehat. `503` berarti salah satu dari koneksi database, `JWT_SECRET`, atau direktori upload tidak bisa dipakai, dan penyebabnya ada di `journalctl`.

### 5. Upgrade

```bash
cd /srv/utm-tv/app
sudo cp .env .env.backup
sudo -u utmtv git pull
sudo -u utmtv npm ci
sudo -u utmtv npm run check
sudo -u utmtv npm run build
sudo -u utmtv npm run prisma:deploy
sudo -u utmtv npm prune --omit=dev
sudo systemctl restart utm-tv
```

Urutannya penting. Migration dijalankan setelah build supaya kalau migration gagal, versi aplikasi yang sedang jalan belum tergantikan dan masih melayani pengguna.

Pastikan `.env` tidak berubah setelah upgrade. Kalau `JWT_SECRET` berubah, semua sesi admin yang sedang terbuka langsung tidak berlaku dan everybody harus login ulang.

### 6. Backup

Dua data yang harus dicadangkan: database dan direktori upload. Keduanya perlu bersamaan, karena record permohonan menunjuk nama berkas di dalam direktori upload. Database tanpa upload menghasilkan lampiran hilang; upload tanpa database menghasilkan berkas yatim yang tidak punya record.

```bash
cd /srv/utm-tv

# Database. Single-transaction menjaga dump konsisten walau ada yang menulis.
mysqldump -u utmtv -p utm_tv_liputan \
  --single-transaction --routines --triggers > backup-db.sql

# Upload
tar czf backup-uploads.tar.gz -C /srv/utm-tv uploads
```

Simpan kedua file di luar server yang sama, karena backup di mesin yang sama hilang bersama server. Jalankan restore sekali untuk memastikan filenya benar-benar bisa dipakai:

```bash
mysql -u utmtv -p utm_tv_liputan < backup-db.sql
tar xzf backup-uploads.tar.gz -C /srv/utm-tv
```

Contoh cron harian, jam 3 pagi:

```cron
0 3 * * * cd /srv/utm-tv && /usr/bin/mysqldump -u utmtv -p'password-database-kuat' utm_tv_liputan --single-transaction --routines --triggers | gzip > /srv/utm-tv/backup-db.sql.gz && tar czf /srv/utm-tv/backup-uploads.tar.gz -C /srv/utm-tv uploads && rm -f /srv/utm-tv/backup-db.sql
```

Password di dalam crontab tersimpan dalam file `/var/spool/cron/crontabs/root`, jadi file itu sendiri harus `chmod 600`. Alternatif yang lebih aman adalah `~/.my.cnf` dengan mode `600`.

### 7. Operasional

```bash
sudo systemctl status utm-tv          # status
sudo systemctl restart utm-tv        # restart
sudo systemctl stop utm-tv           # berhenti
sudo journalctl -u utm-tv -f         # log realtime
sudo journalctl -u utm-tv --since today
```

Batasi ukuran log journald supaya tidak memenuhi disk, di `/etc/systemd/journald.conf`:

```ini
[Journal]
SystemMaxUse=500M
```

Lalu `sudo systemctl restart systemd-journald`.

## Opsi: Docker Compose

Compose menjalankan tiga service: `mysql`, `migrate` (sekali jalan lalu berhenti), dan `app`. Berguna kalau di server lain sudah ada Docker atau kalau mau menguji konfigurasi yang mendekati produksi tanpa menyentuh server utama.

```bash
docker compose up --build
```

Yang perlu diketahui:

- Migration berjalan otomatis sebelum app naik. Service `migrate` menunggu MySQL sehat, menjalankan `prisma migrate deploy`, lalu berhenti dengan exit code 0. Kalau migration gagal, app tidak ikut naik.
- Port MySQL tidak dipublikasikan ke host, jadi database hanya bisa dijangkau dari container app. Untuk masuk manual: `docker compose exec mysql mysql -u root -p utmtv_liputan`.
- Seed admin lewat service migrate, karena `migrate` sudah berhenti: `docker compose run --rm migrate npx tsx prisma/seed.ts`.
- Log container dibatasi 10 MB x 5 file lewat driver `json-file`.

`MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, dan `JWT_SECRET` wajib diisi di `.env`, compose berhenti kalau kosong.

## Struktur Penting

- `app/` - halaman UI dan API routes Next.js.
- `components/` - komponen UI bersama. `components/PermohonanForm.tsx` adalah satu-satunya implementasi form pengajuan, dipakai bersama oleh halaman publik, modal input manual admin, dan modal ubah data admin.
- `lib/` - Prisma, auth, email, upload, validasi env, rate limit.
- `lib/permohonan-form.ts` - definisi field per jenis permohonan, dipakai bersama oleh form, skema validasi, dan route. Kolom database tiap field ikut didefinisikan di sini sebagai sumber tunggal untuk prefill form admin, payload update, dan diff notifikasi.
- `lib/permohonan-record.ts` - satu-satunya tempat pemetaan jenis permohonan ke model Prisma dan tabel status history-nya, dipakai bersama oleh route, lib upload, dan halaman detail.
- `lib/permohonan-edit.ts` - alur ubah data permohonan: validasi, payload kolom, penggantian lampiran, dan pencatatan riwayat perubahan.
- `lib/permohonan-delete.ts` - alur hapus permohonan: penghapusan record, kebersihan lampiran, dan batasannya soal jejak audit.
- `lib/permohonan-notify.ts` - pengiriman notifikasi email dan WhatsApp, dipakai bersama oleh perubahan status dan perubahan data.
- `public/assets/` - logo UTM TV dan favicon.
- `prisma/schema.prisma` - skema ORM.
- `prisma/migrations/20260520000000_init/migration.sql` - migration SQL MySQL.
- `prisma/seed.ts` - seed admin dari environment variable.
- `scripts/seed-dummy.ts` - data contoh untuk mencoba aplikasi: 24 record di bulan berjalan, tersebar di keempat jenis, lengkap dengan lampiran PDF, riwayat status, dan satu record yang dicatat manual. Setiap record ditandai `[dummy]` pada `catatan_internal`, jadi `npm run db:seed:dummy -- --bersihkan` hanya menghapus data contoh dan tidak pernah menyentuh data asli.
- `uploads/` - direktori upload lokal, tidak masuk git. Defaultnya di dalam repo. Kalau `UPLOAD_DIR` menunjuk ke luar, direktori itu ikut masuk backup dan tidak ikut terhapus saat `git pull`.
- `app/error.tsx`, `app/not-found.tsx` - halaman error dan 404. Rincian error tidak pernah ditampilkan ke browser, hanya kode laporan yang juga ada di log server.

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Nilai sensitif seperti password admin, `JWT_SECRET`, `MYSQL_PASSWORD`, dan `MYSQL_ROOT_PASSWORD` tidak boleh dikomit.

| Nama | Wajib | Bawaan | Keterangan |
| --- | --- | --- | --- |
| `DATABASE_URL` | di luar Compose | - | Dipakai Prisma CLI dan aplikasi. Compose merakit sendiri dari `MYSQL_*`. |
| `MYSQL_*` | untuk Compose | - | Dipakai compose dan saat membuat user MySQL di server. |
| `JWT_SECRET` | ya | - | Menandatangani cookie sesi admin. Mengubahnya membuat semua sesi admin logout. |
| `SESSION_SECRET` | tidak | - | Cadangan kalau `JWT_SECRET` kosong. |
| `ADMIN_SEED_EMAIL` | untuk seed | - | Email admin pertama. |
| `ADMIN_SEED_PASSWORD` | untuk seed | - | Password admin pertama. |
| `APP_URL` | tidak | `http://localhost:3000` | Dipakai tautan email. Harus domain publik di produksi. |
| `APP_PORT` / `APP_BIND` | tidak | `3000` / `0.0.0.0` | Hanya dipakai Compose. Di luar Compose pakai `PORT` di systemd. |
| `TRUSTED_PROXY_HOPS` | tidak | `0` | Jumlah proxy yang menyisipkan `X-Forwarded-For`. |
| `UPLOAD_DIR` | tidak | `./uploads` | Dibaca server, tidak boleh ditutupi browser. |
| `MAX_FILE_SIZE_MB` | tidak | `10` | Batas ukuran upload. |
| `ALLOWED_EMAIL_DOMAINS` | tidak | domain TRUNOJOYO | Daftar domain yang boleh mendaftar. |
| `SMTP_*` | tidak | kosong | Kosong berarti email dicetak ke console. |
| `FONNTE_WA_API`, `FONNTE_GROUP_ID` | tidak | kosong | Kosong berarti notifikasi WhatsApp dilewati. |

SMTP bersifat opsional. Jika `SMTP_HOST`, `SMTP_PORT`, dan `SMTP_FROM` kosong, aplikasi tetap berjalan dan email dicetak ke console. Ini berguna saat debugging, tapi berarti notifikasi hilang di produksi, jadi isi sebelum server dipakai sungguhan.

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

- Query database melalui Prisma, tidak ada string SQL yang dirangkai dari input pengguna.
- Password admin di-hash dengan bcrypt.
- Cookie admin `httpOnly`, `sameSite=lax`, dan otomatis `secure` di production.
- Pesan lacak gagal dibuat generik: `Data tidak ditemukan.`
- Login memakai bcrypt terhadap hash tetap kalau email tidak ada, jadi waktu responsnya tidak membocorkan email mana yang terdaftar. Login juga dibatasi per-IP dan per-email.
- Rate limit membaca IP dari `X-Forwarded-For` hanya sebanyak `TRUSTED_PROXY_HOPS`. Tanpa konfigurasi itu, header itu diabaikan dan semua permintaan dihitung sebagai satu alamat.
- Upload divalidasi tiga lapis: ekstensi dan MIME type harus saling cocok sebagai pasangan, bytes pertama berkas harus cocok dengan magic bytes format itu, dan batas ukuran diperiksa. Mengganti ekstensi saja tidak cukup.
- Path lampiran dibaca dari database, bukan dari input request. `resolveUploadPath` menolak nama berkas yang keluar dari direktori upload, termasuk kasus seperti `../rahasia.txt` dan `sub/../../luar.txt`.
- Endpoint `/api/health` tidak butuh autentikasi supaya bisa dipakai pemeriksaan uptime, tapi tidak mengembalikan pesan error internal. Yang dikembalikan hanya `{"status":"ok"}` atau `{"status":"unhealthy"}`; rinciannya ditulis ke log server.
- Header keamanan (nosniff, frame DENY, referrer policy, permissions policy, HSTS) dipasang di semua route. Endpoint preview lampiran memakai CSP `sandbox; default-src 'none'` supaya berkas yang diunggah tidak pernah berjalan sebagai skrip di origin aplikasi.
- `X-Powered-By` dimatikan dan `/admin` serta `/api` diberi `X-Robots-Tag: noindex, nofollow`.

Hal yang belum dikerjakan dan sebaiknya jadi-PR berikutnya:

- Rate limit masih in-memory per proses Node. Kalau someday aplikasi dijalankan lebih dari satu replica di belakang load balancer, batasnya jadi per-instance, bukan global.
- Tautan reset password memakai token yang disimpan di database dengan masa berlaku, tapi belum ada pembatasan jumlah permintaan reset per alamat.
- `client_max_body_size` dan `MAX_FILE_SIZE_MB` adalah dua batas terpisah. Kalau keduanya tidak sinkron, permintaan ditolak oleh nginx lebih dulu tanpa pesan dari aplikasi.
