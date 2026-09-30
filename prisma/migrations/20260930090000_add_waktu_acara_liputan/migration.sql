-- Waktu acara untuk pengajuan liputan, opsional dan disimpan sebagai "HH:mm".
-- Nullable supaya baris yang sudah ada tidak perlu diisi ulang, dan VarChar(5)
-- mengikuti kolom waktu_mulai/waktu_selesai pada peminjaman ruang podcast.
ALTER TABLE `permohonan_liputan` ADD COLUMN `waktu_acara` VARCHAR(5) NULL;
