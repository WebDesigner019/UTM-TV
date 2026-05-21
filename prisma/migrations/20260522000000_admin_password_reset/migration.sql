CREATE TABLE `admin_password_reset_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `used_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `admin_password_reset_tokens_token_hash_key`(`token_hash`),
  INDEX `admin_password_reset_tokens_admin_id_idx`(`admin_id`),
  INDEX `admin_password_reset_tokens_expires_at_idx`(`expires_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

ALTER TABLE `admin_password_reset_tokens`
  ADD CONSTRAINT `admin_password_reset_tokens_admin_id_fkey`
  FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
