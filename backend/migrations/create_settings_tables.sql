-- Create settings table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Setting key (e.g., tahun_ajaran_aktif, semester_aktif)',
  `value` TEXT NULL COMMENT 'Setting value',
  `description` VARCHAR(255) NULL COMMENT 'Description of the setting',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `username` VARCHAR(50) NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'Login, Create, Update, Delete, etc',
  `description` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO `settings` (`key`, `value`, `description`) VALUES
('tahun_ajaran_aktif', '2024/2025', 'Tahun ajaran yang sedang berjalan'),
('semester_aktif', 'Ganjil', 'Semester yang sedang berjalan (Ganjil/Genap)'),
('kkm_default', '75', 'Kriteria Ketuntasan Minimal default'),
('bobot_harian', '30', 'Bobot nilai harian dalam persen'),
('bobot_uts', '30', 'Bobot nilai UTS dalam persen'),
('bobot_uas', '40', 'Bobot nilai UAS dalam persen')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
