-- Input manual oleh admin.
--
-- Kolom email (dan no_wa pada liputan) dibuat nullable supaya data yang
-- dicatat admin tidak perlu email maupun nomor WhatsApp. Kolom email pada
-- media_partner, kerjasama, dan peminjaman_podcast sebelumnya NOT NULL dan
-- tidak pernah tercatat di schema.prisma, jadi ikut diselaraskan di sini.
--
-- Kolom file_* dibuat nullable pada migrasi 20260926000001, karena formulir
-- input manual admin tidak meminta unggah surat.

-- AlterTable
ALTER TABLE `permohonan_liputan`
  MODIFY COLUMN `email` VARCHAR(191) NULL,
  MODIFY COLUMN `no_wa` VARCHAR(191) NULL,
  ADD COLUMN `input_manually_entered` TINYINT(1) NOT NULL DEFAULT FALSE;

-- AlterTable
ALTER TABLE `permohonan_media_partner`
  MODIFY COLUMN `email` VARCHAR(191) NULL,
  ADD COLUMN `input_manually_entered` TINYINT(1) NOT NULL DEFAULT FALSE;

-- AlterTable
ALTER TABLE `permohonan_kerjasama`
  MODIFY COLUMN `email` VARCHAR(191) NULL,
  ADD COLUMN `input_manually_entered` TINYINT(1) NOT NULL DEFAULT FALSE;

-- AlterTable
ALTER TABLE `permohonan_peminjaman_podcast`
  MODIFY COLUMN `email` VARCHAR(191) NULL,
  ADD COLUMN `input_manually_entered` TINYINT(1) NOT NULL DEFAULT FALSE;
