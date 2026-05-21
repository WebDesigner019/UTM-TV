CREATE TABLE `admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `admins_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

CREATE TABLE `permohonan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nomor_rujukan` VARCHAR(32) NOT NULL,
  `nama_instansi` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `nama_acara` VARCHAR(191) NOT NULL,
  `tanggal_acara` DATE NOT NULL,
  `tempat_acara` VARCHAR(191) NOT NULL,
  `file_path` VARCHAR(191) NOT NULL,
  `file_original_name` VARCHAR(191) NOT NULL,
  `file_mime_type` VARCHAR(191) NOT NULL,
  `file_size_bytes` INT NOT NULL,
  `status` ENUM('diterima','dalam_semakan','disetujui','ditolak','dijadualkan','selesai') NOT NULL DEFAULT 'diterima',
  `pesan_pemohon` TEXT NULL,
  `catatan_internal` TEXT NULL,
  `token_lacak` VARCHAR(191) NULL,
  `token_lacak_expires_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `permohonan_nomor_rujukan_key`(`nomor_rujukan`),
  UNIQUE INDEX `permohonan_token_lacak_key`(`token_lacak`),
  INDEX `permohonan_email_idx`(`email`),
  INDEX `permohonan_status_idx`(`status`),
  INDEX `permohonan_created_at_idx`(`created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

CREATE TABLE `status_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `permohonan_id` INT NOT NULL,
  `status_lama` ENUM('diterima','dalam_semakan','disetujui','ditolak','dijadualkan','selesai') NULL,
  `status_baru` ENUM('diterima','dalam_semakan','disetujui','ditolak','dijadualkan','selesai') NOT NULL,
  `pesan` TEXT NULL,
  `changed_by_admin_id` INT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `status_history_permohonan_id_idx`(`permohonan_id`),
  INDEX `status_history_changed_by_admin_id_idx`(`changed_by_admin_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

CREATE TABLE `pengaturan` (
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

ALTER TABLE `status_history`
  ADD CONSTRAINT `status_history_permohonan_id_fkey`
  FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `status_history`
  ADD CONSTRAINT `status_history_changed_by_admin_id_fkey`
  FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
