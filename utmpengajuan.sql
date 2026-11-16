-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 02 Okt 2026 pada 02.06
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `utm_tv_liputan`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `admins`
--

INSERT INTO `admins` (`id`, `nama`, `email`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 'Admin UTM TV', 'admin@trunojoyo.ac.id', '$2a$12$aGZoqX.mp35z.mmHrrjdbewh1zL39Eq1nm8z6T26m5psRiBYU5ymS', '2026-06-06 05:44:12.347', '2026-06-06 05:44:26.863'),
(2, 'Admin UTM-TV', 'tv@trunojoyo.ac.id', '$2a$12$h7BEe.RHs8ZAEcZInU/aP.2T1tB2aAI/wMxgsQmlSM9Y9VuQbNQ1y', '2026-06-06 05:44:52.340', '2026-10-02 00:05:16.258');

-- --------------------------------------------------------

--
-- Struktur dari tabel `admin_password_reset_tokens`
--

CREATE TABLE `admin_password_reset_tokens` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `used_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengaturan`
--

CREATE TABLE `pengaturan` (
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `pengaturan`
--

INSERT INTO `pengaturan` (`key`, `value`, `created_at`, `updated_at`) VALUES
('tampilkan_statistik_landing', 'true', '2026-06-06 05:44:12.372', '2026-06-06 05:44:12.372');

-- --------------------------------------------------------

--
-- Struktur dari tabel `permohonan_kerjasama`
--

CREATE TABLE `permohonan_kerjasama` (
  `id` int(11) NOT NULL,
  `nomor_rujukan` varchar(32) NOT NULL,
  `fakultas_organisasi` varchar(191) NOT NULL,
  `nama_acara` varchar(191) NOT NULL,
  `tanggal_request_upload` date DEFAULT NULL,
  `kontak_penanggung_jawab` varchar(191) NOT NULL,
  `file_path` varchar(191) DEFAULT NULL,
  `file_original_name` varchar(191) DEFAULT NULL,
  `file_mime_type` varchar(191) DEFAULT NULL,
  `file_size_bytes` int(11) DEFAULT NULL,
  `status` enum('diterima','disetujui','ditolak','selesai') NOT NULL DEFAULT 'diterima',
  `pesan_pemohon` text DEFAULT NULL,
  `catatan_internal` text DEFAULT NULL,
  `token_lacak` varchar(191) DEFAULT NULL,
  `token_lacak_expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `input_manually_entered` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `permohonan_liputan`
--

CREATE TABLE `permohonan_liputan` (
  `id` int(11) NOT NULL,
  `nomor_rujukan` varchar(32) NOT NULL,
  `nama_instansi` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `nama_acara` varchar(191) NOT NULL,
  `tanggal_acara` date NOT NULL,
  `tempat_acara` varchar(191) NOT NULL,
  `file_path` varchar(191) DEFAULT NULL,
  `file_original_name` varchar(191) DEFAULT NULL,
  `file_mime_type` varchar(191) DEFAULT NULL,
  `file_size_bytes` int(11) DEFAULT NULL,
  `status` enum('diterima','disetujui','ditolak','selesai') NOT NULL DEFAULT 'diterima',
  `pesan_pemohon` text DEFAULT NULL,
  `catatan_internal` text DEFAULT NULL,
  `token_lacak` varchar(191) DEFAULT NULL,
  `token_lacak_expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `no_wa` varchar(191) DEFAULT NULL,
  `detail_peserta_audiens` text DEFAULT NULL,
  `input_manually_entered` tinyint(1) NOT NULL DEFAULT 0,
  `waktu_acara` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `permohonan_liputan`
--

INSERT INTO `permohonan_liputan` (`id`, `nomor_rujukan`, `nama_instansi`, `email`, `nama_acara`, `tanggal_acara`, `tempat_acara`, `file_path`, `file_original_name`, `file_mime_type`, `file_size_bytes`, `status`, `pesan_pemohon`, `catatan_internal`, `token_lacak`, `token_lacak_expires_at`, `created_at`, `updated_at`, `no_wa`, `detail_peserta_audiens`, `input_manually_entered`, `waktu_acara`) VALUES
(1, 'UTMTV-2026-0001', 'galeeh', 'galeh@student.trunojoyo.ac.id', 'test', '2026-06-15', 'redaksi', '1781415673250-08c664e647e81975.pdf', 'CV Muhammad Ilyas Zaini.pdf', 'application/pdf', 482300, 'disetujui', NULL, NULL, NULL, NULL, '2026-06-14 05:41:13.267', '2026-09-09 23:19:41.036', '086806214788', NULL, 0, NULL),
(2, 'UTMTV-2026-0002', 'galliih', 'galih@trunojoyo.ac.id', 'test lih', '2026-06-16', 'kantor redaksi', '1781416463094-b462f91d7435169a.pdf', 'CV Muhammad Ilyas Zaini.pdf', 'application/pdf', 482300, 'disetujui', NULL, NULL, NULL, NULL, '2026-06-14 05:54:23.106', '2026-06-14 05:59:20.147', '085806214788', NULL, 0, NULL),
(3, 'UTMTV-2026-0003', 'test', 'test@trunojoyo.ac.id', 'test', '2026-06-16', 'bxsbsdfbsf', '1781417033760-9dc2536cb7dbc73a.pdf', 'CV-Muhammad Ilyas Zaini-Updated 2024.pdf', 'application/pdf', 91948, 'disetujui', 'tetssdfd', 'sfsdfds', NULL, NULL, '2026-06-14 06:03:53.767', '2026-06-14 08:35:46.777', '085806214788', NULL, 0, NULL),
(4, 'UTMTV-2026-0004', 'rektorat', '220411100181@student.trunojoyo.ac.id', 'adasdf', '2026-06-30', 'czasd', '1781426257363-9b37c24f23762846.pdf', 'CV Muhammad Ilyas Zaini.pdf', 'application/pdf', 482300, 'disetujui', 'fgfds', 'dfgsfdg', NULL, NULL, '2026-06-14 08:37:37.372', '2026-06-14 08:39:02.332', '085806214788', NULL, 0, NULL),
(5, 'UTMTV-2026-0005', 'testlagi', '220411100181@student.trunojoyo.ac.id', 'testkuy', '2026-06-26', 'rektorat lt6', '1781435025907-4af060a9c31f5329.pdf', 'CV-Muhammad Ilyas Zaini-Updated 2024.pdf', 'application/pdf', 91948, 'disetujui', NULL, NULL, NULL, NULL, '2026-06-14 11:03:45.924', '2026-06-14 11:20:20.990', '085806214788', '4 anak baik', 0, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `permohonan_media_partner`
--

CREATE TABLE `permohonan_media_partner` (
  `id` int(11) NOT NULL,
  `nomor_rujukan` varchar(32) NOT NULL,
  `fakultas_organisasi` varchar(191) NOT NULL,
  `nama_acara` varchar(191) NOT NULL,
  `tanggal_request_upload` date NOT NULL,
  `kontak_penanggung_jawab` varchar(191) NOT NULL,
  `file_path` varchar(191) DEFAULT NULL,
  `file_original_name` varchar(191) DEFAULT NULL,
  `file_mime_type` varchar(191) DEFAULT NULL,
  `file_size_bytes` int(11) DEFAULT NULL,
  `status` enum('diterima','disetujui','ditolak','selesai') NOT NULL DEFAULT 'diterima',
  `pesan_pemohon` text DEFAULT NULL,
  `catatan_internal` text DEFAULT NULL,
  `token_lacak` varchar(191) DEFAULT NULL,
  `token_lacak_expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `input_manually_entered` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `permohonan_peminjaman_podcast`
--

CREATE TABLE `permohonan_peminjaman_podcast` (
  `id` int(11) NOT NULL,
  `nomor_rujukan` varchar(32) NOT NULL,
  `nama_instansi` varchar(191) NOT NULL,
  `nama_acara` varchar(191) NOT NULL,
  `tanggal_peminjaman` date NOT NULL,
  `waktu_mulai` varchar(5) NOT NULL,
  `waktu_selesai` varchar(5) NOT NULL,
  `kontak_penanggung_jawab` varchar(191) NOT NULL,
  `note_detail` text NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `file_rekom_bakk_path` varchar(191) DEFAULT NULL,
  `file_rekom_bakk_original_name` varchar(191) DEFAULT NULL,
  `file_rekom_bakk_mime_type` varchar(191) DEFAULT NULL,
  `file_rekom_bakk_size_bytes` int(11) DEFAULT NULL,
  `file_pernyataan_path` varchar(191) DEFAULT NULL,
  `file_pernyataan_original_name` varchar(191) DEFAULT NULL,
  `file_pernyataan_mime_type` varchar(191) DEFAULT NULL,
  `file_pernyataan_size_bytes` int(11) DEFAULT NULL,
  `status` enum('diterima','disetujui','ditolak','selesai') NOT NULL DEFAULT 'diterima',
  `pesan_pemohon` text DEFAULT NULL,
  `catatan_internal` text DEFAULT NULL,
  `token_lacak` varchar(191) DEFAULT NULL,
  `token_lacak_expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `input_manually_entered` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `status_history_kerjasama`
--

CREATE TABLE `status_history_kerjasama` (
  `id` int(11) NOT NULL,
  `permohonan_id` int(11) NOT NULL,
  `status_lama` enum('diterima','disetujui','ditolak','selesai') DEFAULT NULL,
  `status_baru` enum('diterima','disetujui','ditolak','selesai') NOT NULL,
  `pesan` text DEFAULT NULL,
  `changed_by_admin_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `status_history_liputan`
--

CREATE TABLE `status_history_liputan` (
  `id` int(11) NOT NULL,
  `permohonan_id` int(11) NOT NULL,
  `status_lama` enum('diterima','disetujui','ditolak','selesai') DEFAULT NULL,
  `status_baru` enum('diterima','disetujui','ditolak','selesai') NOT NULL,
  `pesan` text DEFAULT NULL,
  `changed_by_admin_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `status_history_liputan`
--

INSERT INTO `status_history_liputan` (`id`, `permohonan_id`, `status_lama`, `status_baru`, `pesan`, `changed_by_admin_id`, `created_at`) VALUES
(1, 1, NULL, 'diterima', 'Permohonan diterima oleh sistem.', NULL, '2026-06-14 05:41:13.267'),
(2, 2, NULL, 'diterima', 'Permohonan diterima oleh sistem.', NULL, '2026-06-14 05:54:23.106'),
(3, 2, 'diterima', 'disetujui', NULL, 2, '2026-06-14 05:59:20.161'),
(4, 3, NULL, 'diterima', 'Permohonan diterima oleh sistem.', NULL, '2026-06-14 06:03:53.767'),
(5, 3, 'diterima', 'disetujui', 'tetssdfd', 2, '2026-06-14 08:35:46.786'),
(6, 4, NULL, 'diterima', 'Permohonan diterima oleh sistem.', NULL, '2026-06-14 08:37:37.372'),
(7, 4, 'diterima', 'disetujui', 'fgfds', 2, '2026-06-14 08:39:02.335'),
(8, 5, NULL, 'diterima', 'Permohonan diterima oleh sistem.', NULL, '2026-06-14 11:03:45.924'),
(9, 5, 'diterima', 'disetujui', NULL, 2, '2026-06-14 11:20:21.011'),
(10, 1, 'diterima', 'disetujui', NULL, 2, '2026-09-09 23:19:41.041');

-- --------------------------------------------------------

--
-- Struktur dari tabel `status_history_media_partner`
--

CREATE TABLE `status_history_media_partner` (
  `id` int(11) NOT NULL,
  `permohonan_id` int(11) NOT NULL,
  `status_lama` enum('diterima','disetujui','ditolak','selesai') DEFAULT NULL,
  `status_baru` enum('diterima','disetujui','ditolak','selesai') NOT NULL,
  `pesan` text DEFAULT NULL,
  `changed_by_admin_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `status_history_peminjaman_podcast`
--

CREATE TABLE `status_history_peminjaman_podcast` (
  `id` int(11) NOT NULL,
  `permohonan_id` int(11) NOT NULL,
  `status_lama` enum('diterima','disetujui','ditolak','selesai') DEFAULT NULL,
  `status_baru` enum('diterima','disetujui','ditolak','selesai') NOT NULL,
  `pesan` text DEFAULT NULL,
  `changed_by_admin_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('23a950a1-e230-44df-a7d4-b38d9b757591', '5ffd6fc875fc7386cb75dece1abc7bf57e225c5c5d8469666fc01e3604f0b6ba', '2026-09-30 17:59:17.510', '20260926000001_admin_manual_no_file', NULL, NULL, '2026-09-30 17:59:17.246', 1),
('31be8e79-9934-4309-b8d7-6d69570b3716', 'ec2ace946d70291ba2df800fa4ec06cbee3d08e3575a7e2bbe33eba54ecde1b7', '2026-09-30 17:59:17.532', '20260930090000_add_waktu_acara_liputan', NULL, NULL, '2026-09-30 17:59:17.514', 1),
('4c7068a4-94c1-4ede-a8a9-95ead30ea63a', '6700ecc0425c0d5077019d79815af28b6876894acbdf433d3958d2a50d50e80c', '2026-06-06 05:41:23.165', '20260522000000_admin_password_reset', NULL, NULL, '2026-06-06 05:41:23.058', 1),
('581f6ef2-89ca-4873-847c-a80bc42f3b32', '66c4379dfadd8aca3c14cff58cf3ce7ec027dff8d228c348cbbe282ae39f1684', '2026-06-14 06:51:21.421', '20260614053000_remove_statuses', NULL, NULL, '2026-06-14 06:51:21.256', 1),
('5d825982-d2cb-4d7d-bc89-3a55140fb12f', 'c04072f521897d80cae34f82afc8f1a2bba239872b1598c8bbbbbf9a572fb76a', '2026-06-06 05:41:23.055', '20260520000000_init', NULL, NULL, '2026-06-06 05:41:22.825', 1),
('7f5f61a1-afb3-440a-891c-2486c0bb425e', '13fdbae09b843ca8c3e725a42448b23c7c76be0c9801c7e672c956826ec7e8f9', '2026-06-14 10:56:13.247', '20260614105613_add_detail_peserta_audiens', NULL, NULL, '2026-06-14 10:56:13.229', 1),
('8a190804-dadd-45c7-9fa1-1aa84372d25d', 'fa1b31e9d397435bfdba8c43191be23b431a4e17bf9aee9c7616e140530c887c', '2026-09-07 16:28:06.027', '20260907000000_add_media_partner_kerjasama', NULL, NULL, '2026-09-07 16:28:05.742', 1),
('baa61cc5-4bab-422f-9b65-95b781c10221', 'dd153f376ed3ba0b50d692e8dd1bc6d8a6c89f2935d5e19ba1576563e013fb42', '2026-09-24 14:32:53.805', '20260915000000_add_email_mp_kerjasama', NULL, NULL, '2026-09-24 21:32:53.812', 1),
('ce884718-beeb-411c-881b-0065ecf05b2b', 'a474ee8dd58471085332346e1b123d1c781cc3e1ff3211157f642a1975b8ae5d', '2026-09-24 14:44:17.050', '20260924150000_add_peminjaman_podcast', NULL, NULL, '2026-09-24 21:44:17.052', 1),
('d7f6d1c6-a775-4e6e-8737-1cd40ddf7ff9', 'cd68a6dbda37121b7761c82b1fb871ac54e64831ca0a13a5717f45c645e575a4', '2026-09-30 17:59:17.243', '20260926000000_admin_manual_input', NULL, NULL, '2026-09-30 17:59:16.938', 1),
('ea651f1d-c08b-4cdc-864a-8f819b21f20a', '09ea037af57c0ba6aec8ec0f01a14ff9dfb75327c679ee5b54cff2d04834e52e', '2026-06-14 05:25:27.095', '20260614052516_add_no_wa', NULL, NULL, '2026-06-14 05:25:27.077', 1),
('f31122cb-c4a0-4172-89ee-13971d53245d', '25a5f05cfbc955361e24824abb0ac532c11feb7702263af9a3f76aa78bde1cf7', '2026-09-24 14:32:53.819', '20260915200000_rename_permohonan_to_liputan', NULL, NULL, '2026-09-24 21:32:53.823', 1);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_key` (`email`);

--
-- Indeks untuk tabel `admin_password_reset_tokens`
--
ALTER TABLE `admin_password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_password_reset_tokens_token_hash_key` (`token_hash`),
  ADD KEY `admin_password_reset_tokens_admin_id_idx` (`admin_id`),
  ADD KEY `admin_password_reset_tokens_expires_at_idx` (`expires_at`);

--
-- Indeks untuk tabel `pengaturan`
--
ALTER TABLE `pengaturan`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `permohonan_kerjasama`
--
ALTER TABLE `permohonan_kerjasama`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permohonan_kerjasama_nomor_rujukan_key` (`nomor_rujukan`),
  ADD UNIQUE KEY `permohonan_kerjasama_token_lacak_key` (`token_lacak`),
  ADD KEY `permohonan_kerjasama_status_idx` (`status`),
  ADD KEY `permohonan_kerjasama_created_at_idx` (`created_at`);

--
-- Indeks untuk tabel `permohonan_liputan`
--
ALTER TABLE `permohonan_liputan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permohonan_liputan_nomor_rujukan_key` (`nomor_rujukan`),
  ADD UNIQUE KEY `permohonan_liputan_token_lacak_key` (`token_lacak`),
  ADD KEY `permohonan_liputan_created_at_idx` (`created_at`),
  ADD KEY `permohonan_liputan_email_idx` (`email`),
  ADD KEY `permohonan_liputan_status_idx` (`status`);

--
-- Indeks untuk tabel `permohonan_media_partner`
--
ALTER TABLE `permohonan_media_partner`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permohonan_media_partner_nomor_rujukan_key` (`nomor_rujukan`),
  ADD UNIQUE KEY `permohonan_media_partner_token_lacak_key` (`token_lacak`),
  ADD KEY `permohonan_media_partner_status_idx` (`status`),
  ADD KEY `permohonan_media_partner_created_at_idx` (`created_at`);

--
-- Indeks untuk tabel `permohonan_peminjaman_podcast`
--
ALTER TABLE `permohonan_peminjaman_podcast`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permohonan_peminjaman_podcast_nomor_rujukan_key` (`nomor_rujukan`),
  ADD UNIQUE KEY `permohonan_peminjaman_podcast_token_lacak_key` (`token_lacak`),
  ADD KEY `permohonan_peminjaman_podcast_status_idx` (`status`),
  ADD KEY `permohonan_peminjaman_podcast_created_at_idx` (`created_at`);

--
-- Indeks untuk tabel `status_history_kerjasama`
--
ALTER TABLE `status_history_kerjasama`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status_history_kerjasama_permohonan_id_idx` (`permohonan_id`),
  ADD KEY `status_history_kerjasama_changed_by_admin_id_idx` (`changed_by_admin_id`);

--
-- Indeks untuk tabel `status_history_liputan`
--
ALTER TABLE `status_history_liputan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status_history_liputan_permohonan_id_idx` (`permohonan_id`),
  ADD KEY `status_history_liputan_changed_by_admin_id_idx` (`changed_by_admin_id`);

--
-- Indeks untuk tabel `status_history_media_partner`
--
ALTER TABLE `status_history_media_partner`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status_history_media_partner_permohonan_id_idx` (`permohonan_id`),
  ADD KEY `status_history_media_partner_changed_by_admin_id_idx` (`changed_by_admin_id`);

--
-- Indeks untuk tabel `status_history_peminjaman_podcast`
--
ALTER TABLE `status_history_peminjaman_podcast`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status_history_peminjaman_podcast_permohonan_id_idx` (`permohonan_id`),
  ADD KEY `status_history_peminjaman_podcast_changed_by_admin_id_idx` (`changed_by_admin_id`);

--
-- Indeks untuk tabel `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `admin_password_reset_tokens`
--
ALTER TABLE `admin_password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `permohonan_kerjasama`
--
ALTER TABLE `permohonan_kerjasama`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `permohonan_liputan`
--
ALTER TABLE `permohonan_liputan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `permohonan_media_partner`
--
ALTER TABLE `permohonan_media_partner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `permohonan_peminjaman_podcast`
--
ALTER TABLE `permohonan_peminjaman_podcast`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `status_history_kerjasama`
--
ALTER TABLE `status_history_kerjasama`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `status_history_liputan`
--
ALTER TABLE `status_history_liputan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `status_history_media_partner`
--
ALTER TABLE `status_history_media_partner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `status_history_peminjaman_podcast`
--
ALTER TABLE `status_history_peminjaman_podcast`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `admin_password_reset_tokens`
--
ALTER TABLE `admin_password_reset_tokens`
  ADD CONSTRAINT `admin_password_reset_tokens_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `status_history_kerjasama`
--
ALTER TABLE `status_history_kerjasama`
  ADD CONSTRAINT `status_history_kerjasama_changed_by_admin_id_fkey` FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `status_history_kerjasama_permohonan_id_fkey` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_kerjasama` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `status_history_liputan`
--
ALTER TABLE `status_history_liputan`
  ADD CONSTRAINT `status_history_liputan_changed_by_admin_id_fkey` FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `status_history_liputan_permohonan_id_fkey` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_liputan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `status_history_media_partner`
--
ALTER TABLE `status_history_media_partner`
  ADD CONSTRAINT `status_history_media_partner_changed_by_admin_id_fkey` FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `status_history_media_partner_permohonan_id_fkey` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_media_partner` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `status_history_peminjaman_podcast`
--
ALTER TABLE `status_history_peminjaman_podcast`
  ADD CONSTRAINT `status_history_peminjaman_podcast_changed_by_admin_id_fkey` FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `status_history_peminjaman_podcast_permohonan_id_fkey` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_peminjaman_podcast` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
