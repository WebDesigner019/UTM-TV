-- CreateTable
CREATE TABLE `permohonan_media_partner` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nomor_rujukan` VARCHAR(32) NOT NULL,
    `fakultas_organisasi` VARCHAR(191) NOT NULL,
    `nama_acara` VARCHAR(191) NOT NULL,
    `tanggal_request_upload` DATE NOT NULL,
    `kontak_penanggung_jawab` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `file_original_name` VARCHAR(191) NOT NULL,
    `file_mime_type` VARCHAR(191) NOT NULL,
    `file_size_bytes` INT NOT NULL,
    `status` ENUM('diterima','disetujui','ditolak','selesai') NOT NULL DEFAULT 'diterima',
    `pesan_pemohon` TEXT NULL,
    `catatan_internal` TEXT NULL,
    `token_lacak` VARCHAR(191) NULL,
    `token_lacak_expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `permohonan_media_partner_nomor_rujukan_key`(`nomor_rujukan`),
    UNIQUE INDEX `permohonan_media_partner_token_lacak_key`(`token_lacak`),
    INDEX `permohonan_media_partner_status_idx`(`status`),
    INDEX `permohonan_media_partner_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- CreateTable
CREATE TABLE `status_history_media_partner` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `permohonan_id` INT NOT NULL,
    `status_lama` ENUM('diterima','disetujui','ditolak','selesai') NULL,
    `status_baru` ENUM('diterima','disetujui','ditolak','selesai') NOT NULL,
    `pesan` TEXT NULL,
    `changed_by_admin_id` INT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `status_history_media_partner_permohonan_id_idx`(`permohonan_id`),
    INDEX `status_history_media_partner_changed_by_admin_id_idx`(`changed_by_admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- CreateTable
CREATE TABLE `permohonan_kerjasama` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nomor_rujukan` VARCHAR(32) NOT NULL,
    `fakultas_organisasi` VARCHAR(191) NOT NULL,
    `nama_acara` VARCHAR(191) NOT NULL,
    `tanggal_request_upload` DATE NULL,
    `kontak_penanggung_jawab` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `file_original_name` VARCHAR(191) NOT NULL,
    `file_mime_type` VARCHAR(191) NOT NULL,
    `file_size_bytes` INT NOT NULL,
    `status` ENUM('diterima','disetujui','ditolak','selesai') NOT NULL DEFAULT 'diterima',
    `pesan_pemohon` TEXT NULL,
    `catatan_internal` TEXT NULL,
    `token_lacak` VARCHAR(191) NULL,
    `token_lacak_expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `permohonan_kerjasama_nomor_rujukan_key`(`nomor_rujukan`),
    UNIQUE INDEX `permohonan_kerjasama_token_lacak_key`(`token_lacak`),
    INDEX `permohonan_kerjasama_status_idx`(`status`),
    INDEX `permohonan_kerjasama_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- CreateTable
CREATE TABLE `status_history_kerjasama` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `permohonan_id` INT NOT NULL,
    `status_lama` ENUM('diterima','disetujui','ditolak','selesai') NULL,
    `status_baru` ENUM('diterima','disetujui','ditolak','selesai') NOT NULL,
    `pesan` TEXT NULL,
    `changed_by_admin_id` INT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `status_history_kerjasama_permohonan_id_idx`(`permohonan_id`),
    INDEX `status_history_kerjasama_changed_by_admin_id_idx`(`changed_by_admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- AddForeignKey
ALTER TABLE `status_history_media_partner` ADD CONSTRAINT `status_history_media_partner_permohonan_id_fkey` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_media_partner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_history_media_partner` ADD CONSTRAINT `status_history_media_partner_changed_by_admin_id_fkey` FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_history_kerjasama` ADD CONSTRAINT `status_history_kerjasama_permohonan_id_fkey` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_kerjasama`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_history_kerjasama` ADD CONSTRAINT `status_history_kerjasama_changed_by_admin_id_fkey` FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
