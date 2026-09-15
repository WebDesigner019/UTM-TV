-- RenameTable: mencocokkan tabel liputan lama dengan model Prisma saat ini
RENAME TABLE `permohonan` TO `permohonan_liputan`;
RENAME TABLE `status_history` TO `status_history_liputan`;

-- RenameIndex
ALTER TABLE `permohonan_liputan` RENAME INDEX `permohonan_email_idx` TO `permohonan_liputan_email_idx`;
ALTER TABLE `permohonan_liputan` RENAME INDEX `permohonan_status_idx` TO `permohonan_liputan_status_idx`;
ALTER TABLE `permohonan_liputan` RENAME INDEX `permohonan_created_at_idx` TO `permohonan_liputan_created_at_idx`;
ALTER TABLE `permohonan_liputan` RENAME INDEX `permohonan_nomor_rujukan_key` TO `permohonan_liputan_nomor_rujukan_key`;
ALTER TABLE `permohonan_liputan` RENAME INDEX `permohonan_token_lacak_key` TO `permohonan_liputan_token_lacak_key`;

ALTER TABLE `status_history_liputan` RENAME INDEX `status_history_permohonan_id_idx` TO `status_history_liputan_permohonan_id_idx`;
ALTER TABLE `status_history_liputan` RENAME INDEX `status_history_changed_by_admin_id_idx` TO `status_history_liputan_changed_by_admin_id_idx`;

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