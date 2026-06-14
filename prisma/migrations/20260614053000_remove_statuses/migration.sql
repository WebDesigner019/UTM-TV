-- Update existing records using old statuses before removing them
UPDATE `permohonan` SET `status` = 'diterima' WHERE `status` = 'dalam_semakan';
UPDATE `permohonan` SET `status` = 'disetujui' WHERE `status` = 'dijadualkan';
UPDATE `status_history` SET `status_baru` = 'diterima' WHERE `status_baru` = 'dalam_semakan';
UPDATE `status_history` SET `status_baru` = 'disetujui' WHERE `status_baru` = 'dijadualkan';
UPDATE `status_history` SET `status_lama` = 'diterima' WHERE `status_lama` = 'dalam_semakan';
UPDATE `status_history` SET `status_lama` = 'disetujui' WHERE `status_lama` = 'dijadualkan';

-- AlterTable
ALTER TABLE `permohonan` MODIFY `status` ENUM('diterima', 'disetujui', 'ditolak', 'selesai') NOT NULL DEFAULT 'diterima';
ALTER TABLE `status_history` MODIFY `status_lama` ENUM('diterima', 'disetujui', 'ditolak', 'selesai') NULL;
ALTER TABLE `status_history` MODIFY `status_baru` ENUM('diterima', 'disetujui', 'ditolak', 'selesai') NOT NULL;
