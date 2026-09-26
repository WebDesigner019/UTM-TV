-- Input manual admin tanpa lampiran dokumen.
--
-- Formulir input manual admin sengaja tidak meminta unggah surat, sehingga
-- kolom file_* perlu menerima NULL. Data yang sudah ada tidak berubah karena
-- kolomnya terisi dan tidak ada backfill.

-- AlterTable
ALTER TABLE `permohonan_liputan`
  MODIFY COLUMN `file_path` VARCHAR(191) NULL,
  MODIFY COLUMN `file_original_name` VARCHAR(191) NULL,
  MODIFY COLUMN `file_mime_type` VARCHAR(191) NULL,
  MODIFY COLUMN `file_size_bytes` INTEGER NULL;

-- AlterTable
ALTER TABLE `permohonan_media_partner`
  MODIFY COLUMN `file_path` VARCHAR(191) NULL,
  MODIFY COLUMN `file_original_name` VARCHAR(191) NULL,
  MODIFY COLUMN `file_mime_type` VARCHAR(191) NULL,
  MODIFY COLUMN `file_size_bytes` INTEGER NULL;

-- AlterTable
ALTER TABLE `permohonan_kerjasama`
  MODIFY COLUMN `file_path` VARCHAR(191) NULL,
  MODIFY COLUMN `file_original_name` VARCHAR(191) NULL,
  MODIFY COLUMN `file_mime_type` VARCHAR(191) NULL,
  MODIFY COLUMN `file_size_bytes` INTEGER NULL;

-- AlterTable
ALTER TABLE `permohonan_peminjaman_podcast`
  MODIFY COLUMN `file_rekom_bakk_path` VARCHAR(191) NULL,
  MODIFY COLUMN `file_rekom_bakk_original_name` VARCHAR(191) NULL,
  MODIFY COLUMN `file_rekom_bakk_mime_type` VARCHAR(191) NULL,
  MODIFY COLUMN `file_rekom_bakk_size_bytes` INTEGER NULL,
  MODIFY COLUMN `file_pernyataan_path` VARCHAR(191) NULL,
  MODIFY COLUMN `file_pernyataan_original_name` VARCHAR(191) NULL,
  MODIFY COLUMN `file_pernyataan_mime_type` VARCHAR(191) NULL,
  MODIFY COLUMN `file_pernyataan_size_bytes` INTEGER NULL;
