-- RenameTable: mencocokkan tabel liputan lama dengan model Prisma saat ini
RENAME TABLE `permohonan` TO `permohonan_liputan`;
RENAME TABLE `status_history` TO `status_history_liputan`;

-- RenameIndex (MariaDB-compatible: DROP + ADD index)
ALTER TABLE `permohonan_liputan` DROP INDEX `permohonan_email_idx`, ADD INDEX `permohonan_liputan_email_idx`(`email`);
ALTER TABLE `permohonan_liputan` DROP INDEX `permohonan_status_idx`, ADD INDEX `permohonan_liputan_status_idx`(`status`);
ALTER TABLE `permohonan_liputan` DROP INDEX `permohonan_created_at_idx`, ADD INDEX `permohonan_liputan_created_at_idx`(`created_at`);
ALTER TABLE `permohonan_liputan` DROP INDEX `permohonan_nomor_rujukan_key`, ADD UNIQUE INDEX `permohonan_liputan_nomor_rujukan_key`(`nomor_rujukan`);
ALTER TABLE `permohonan_liputan` DROP INDEX `permohonan_token_lacak_key`, ADD UNIQUE INDEX `permohonan_liputan_token_lacak_key`(`token_lacak`);

ALTER TABLE `status_history_liputan` DROP INDEX `status_history_permohonan_id_idx`, ADD INDEX `status_history_liputan_permohonan_id_idx`(`permohonan_id`);
ALTER TABLE `status_history_liputan` DROP INDEX `status_history_changed_by_admin_id_idx`, ADD INDEX `status_history_liputan_changed_by_admin_id_idx`(`changed_by_admin_id`);

-- RenameForeignKey
ALTER TABLE `status_history_liputan` DROP FOREIGN KEY `status_history_permohonan_id_fkey`;
ALTER TABLE `status_history_liputan` DROP FOREIGN KEY `status_history_changed_by_admin_id_fkey`;

ALTER TABLE `status_history_liputan`
  ADD CONSTRAINT `status_history_liputan_permohonan_id_fkey`
  FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_liputan`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `status_history_liputan`
  ADD CONSTRAINT `status_history_liputan_changed_by_admin_id_fkey`
  FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;