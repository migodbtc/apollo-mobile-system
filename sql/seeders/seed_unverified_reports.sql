-- Seed file: 5 mock unverified (pending) reports centered on Metro Manila
-- Generated: 2025-10-10
-- Usage: run this against the `apollo_system` database (e.g. mysql -u user -p < seed_unverified_reports.sql)

USE `apollo_system`;

-- Insert media entries (empty blobs for mock data). Assign variables for IDs to reference in reports.
INSERT INTO `media_storage` (MS_user_owner, MS_file_type, MS_file_name, MS_file_data) VALUES
(NULL, 'image', 'quiapo_fire_2025-10-10_01.jpg', NULL);
SET @m1 = LAST_INSERT_ID();

INSERT INTO `media_storage` (MS_user_owner, MS_file_type, MS_file_name, MS_file_data) VALUES
(NULL, 'image', 'malate_smoke_2025-10-10_02.jpg', NULL);
SET @m2 = LAST_INSERT_ID();

INSERT INTO `media_storage` (MS_user_owner, MS_file_type, MS_file_name, MS_file_data) VALUES
(NULL, 'image', 'makati_fire_2025-10-10_03.jpg', NULL);
SET @m3 = LAST_INSERT_ID();

INSERT INTO `media_storage` (MS_user_owner, MS_file_type, MS_file_name, MS_file_data) VALUES
(NULL, 'image', 'pasig_smoke_2025-10-10_04.jpg', NULL);
SET @m4 = LAST_INSERT_ID();

-- One video sample
INSERT INTO `media_storage` (MS_user_owner, MS_file_type, MS_file_name, MS_file_data) VALUES
(NULL, 'video', 'quezon_city_video_2025-10-10_05.mp4', NULL);
SET @m5 = LAST_INSERT_ID();

-- Insert 5 preverified_reports referencing the media above. All are unverified (PR_verified = 0) and status = 'pending'.
-- Timestamps use the current date 2025-10-10; adjust times as needed.
INSERT INTO `preverified_reports` (PR_user_id, PR_image, PR_video, PR_latitude, PR_longitude, PR_address, PR_timestamp, PR_verified, PR_report_status) VALUES
(NULL, @m1, NULL, 14.60050000, 120.98570000, 'Quiapo, Manila, Metro Manila, Philippines', '2025-10-10 08:15:00', 0, 'pending'),
(NULL, @m2, NULL, 14.57940000, 120.98240000, 'Malate, Manila, Metro Manila, Philippines', '2025-10-10 09:05:00', 0, 'pending'),
(NULL, @m3, NULL, 14.55470000, 121.02440000, 'Ayala Avenue area, Makati, Metro Manila, Philippines', '2025-10-10 11:30:00', 0, 'pending'),
(NULL, @m4, NULL, 14.57410000, 121.06400000, 'Kapitolyo, Pasig, Metro Manila, Philippines', '2025-10-10 12:45:00', 0, 'pending'),
(NULL, NULL, @m5, 14.62840000, 121.04120000, 'Cubao, Quezon City, Metro Manila, Philippines', '2025-10-10 13:10:00', 0, 'pending');

-- Notes:
-- - PR_user_id set to NULL to avoid FK issues if the referenced users don't exist in the target database. If you want to associate these reports with existing user IDs, replace NULL with valid UA_user_id values.
-- - MS_file_data is NULL here (mock). If you want to store actual media blobs, update the INSERTs to include LOAD_FILE(...) or parameterized BLOBs.
-- - The script assumes the `apollo_system` DB exists and the tables have the same schema as in `apollo_db_v1.0.3.sql`.
-- End of seed file.
