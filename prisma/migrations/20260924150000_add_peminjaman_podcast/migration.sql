-- CreateTable
CREATE TABLE `permohonan_peminjaman_podcast` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomor_rujukan` VARCHAR(32) NOT NULL,
    `nama_instansi` VARCHAR(191) NOT NULL,
    `nama_acara` VARCHAR(191) NOT NULL,
    `tanggal_peminjaman` DATE NOT NULL,
    `waktu_mulai` VARCHAR(5) NOT NULL,
    `waktu_selesai` VARCHAR(5) NOT NULL,
    `kontak_penanggung_jawab` VARCHAR(191) NOT NULL,
    `note_detail` TEXT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `file_rekom_bakk_path` VARCHAR(191) NOT NULL,
    `file_rekom_bakk_original_name` VARCHAR(191) NOT NULL,
    `file_rekom_bakk_mime_type` VARCHAR(191) NOT NULL,
    `file_rekom_bakk_size_bytes` INTEGER NOT NULL,
    `file_pernyataan_path` VARCHAR(191) NOT NULL,
    `file_pernyataan_original_name` VARCHAR(191) NOT NULL,
    `file_pernyataan_mime_type` VARCHAR(191) NOT NULL,
    `file_pernyataan_size_bytes` INTEGER NOT NULL,
    `status` ENUM('diterima', 'disetujui', 'ditolak', 'selesai') NOT NULL DEFAULT 'diterima',
    `pesan_pemohon` TEXT NULL,
    `catatan_internal` TEXT NULL,
    `token_lacak` VARCHAR(191) NULL,
    `token_lacak_expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permohonan_peminjaman_podcast_nomor_rujukan_key`(`nomor_rujukan`),
    UNIQUE INDEX `permohonan_peminjaman_podcast_token_lacak_key`(`token_lacak`),
    INDEX `permohonan_peminjaman_podcast_status_idx`(`status`),
    INDEX `permohonan_peminjaman_podcast_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_history_peminjaman_podcast` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `permohonan_id` INTEGER NOT NULL,
    `status_lama` ENUM('diterima', 'disetujui', 'ditolak', 'selesai') NULL,
    `status_baru` ENUM('diterima', 'disetujui', 'ditolak', 'selesai') NOT NULL,
    `pesan` TEXT NULL,
    `changed_by_admin_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `status_history_peminjaman_podcast_permohonan_id_idx`(`permohonan_id`),
    INDEX `status_history_peminjaman_podcast_changed_by_admin_id_idx`(`changed_by_admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `status_history_peminjaman_podcast` ADD CONSTRAINT `status_history_peminjaman_podcast_permohonan_id_fkey` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_peminjaman_podcast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_history_peminjaman_podcast` ADD CONSTRAINT `status_history_peminjaman_podcast_changed_by_admin_id_fkey` FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;