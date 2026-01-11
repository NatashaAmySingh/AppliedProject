-- Test data for NIS portal
USE nis_portal; 
SET FOREIGN_KEY_CHECKS=0;

-- Create basic roles if they don't exist (use minimal columns to be schema-agnostic)
INSERT IGNORE INTO roles (role_name) VALUES
  ('System Admin'),
  ('Caricom Supervisor'),
  ('Caricom Clerk'),
  ('External Officer');

-- Create a few offices if missing
INSERT IGNORE INTO nis_office (office_name, country_id, email) VALUES
  ('National Insurance Scheme (NIS) Guyana', 1, 'info@nis.gov.gy'),
  ('National Insurance Board (NIB) Trinidad & Tobago', 2, 'info@nibtt.net'),
  ('National Insurance Scheme (NIS) Barbados', 3, 'info@nis.gov.bb');

-- Reuse a known bcrypt hash for Test@123 from the project SQL
SET @pwhash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ELkPqR2qrFfKaW';

-- Insert test users (avoid duplicates by email)
INSERT INTO users (first_name, last_name, email, password_hash, role_id, office_id, is_active)
SELECT * FROM (
  SELECT 'System' as first_name, 'Admin' as last_name, 'admin@nis.gov.gy' as email, @pwhash as password_hash,
    (SELECT role_id FROM roles WHERE role_name='System Admin' LIMIT 1) as role_id,
    (SELECT office_id FROM nis_office WHERE office_name LIKE '%Guyana%' LIMIT 1) as office_id, TRUE as is_active
  UNION ALL
  SELECT 'Avinash','Singh','a.singh@nis.gov.gy',@pwhash,(SELECT role_id FROM roles WHERE role_name='Caricom Supervisor' LIMIT 1),(SELECT office_id FROM nis_office WHERE office_name LIKE '%Guyana%' LIMIT 1),TRUE
  UNION ALL
  SELECT 'Maria','Persaud','clerk1@nis.gov.gy',@pwhash,(SELECT role_id FROM roles WHERE role_name='Caricom Clerk' LIMIT 1),(SELECT office_id FROM nis_office WHERE office_name LIKE '%Guyana%' LIMIT 1),TRUE
  UNION ALL
  SELECT 'Kevin','Johnson','k.johnson@nibtt.net',@pwhash,(SELECT role_id FROM roles WHERE role_name='External Officer' LIMIT 1),(SELECT office_id FROM nis_office WHERE office_name LIKE '%Trinidad%' LIMIT 1),TRUE
  UNION ALL
  SELECT 'Michelle','Brown','m.brown@nis.gov.bb',@pwhash,(SELECT role_id FROM roles WHERE role_name='External Officer' LIMIT 1),(SELECT office_id FROM nis_office WHERE office_name LIKE '%Barbados%' LIMIT 1),TRUE
) AS tmp
ON DUPLICATE KEY UPDATE email = email;

-- Add more users programmatically (10 users)
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, role_id, office_id, is_active)
SELECT CONCAT('Test',n) as first_name, CONCAT('User',n) as last_name,
       CONCAT('test',n,'@example.com') as email, @pwhash as password_hash,
       (SELECT role_id FROM roles WHERE role_name='Caricom Clerk' LIMIT 1) as role_id,
       (SELECT office_id FROM nis_office LIMIT 1) as office_id, TRUE
FROM (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t;

-- Insert claimants (20)
INSERT IGNORE INTO claimants (first_name, last_name, date_of_birth, sex, nis_number, national_id, passport_number, email, created_by)
SELECT CONCAT('Claimant',n), CONCAT('Family',n),
       DATE_SUB(CURDATE(), INTERVAL (30 + n) YEAR),
       IF(n % 2 = 0,'M','F'),
       CONCAT('NIS-', LPAD(n,9,'0')),
       CONCAT('NID-',LPAD(n,6,'0')),
       CONCAT('P',LPAD(n,6,'0')),
       CONCAT('claimant',n,'@example.com'),
       (SELECT user_id FROM users ORDER BY user_id LIMIT 1)
FROM (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20) t;

-- Insert sample requests for first 15 claimants
SET @start = 1;
INSERT IGNORE INTO requests (request_number, claimant_id, requester_id, requesting_country_id, target_country_id, benefit_type_id, employment_period, status, priority, assigned_to, assigned_user_id)
SELECT CONCAT('GY-', YEAR(CURDATE()), '-', LPAD(@start + ids.id - 1,5,'0')) as reqnum,
       c.claimant_id,
       (SELECT user_id FROM users WHERE email='a.singh@nis.gov.gy' LIMIT 1),
       1, 2,
       (SELECT benefit_type_id FROM benefit_types LIMIT 1),
       CONCAT(1980 + ids.id,'-',2000 + ids.id),
       IF(ids.id % 5 = 0, 'CLOSED', IF(ids.id % 3 = 0, 'RESPONDED', 'PENDING')),
       IF(ids.id % 7 = 0,'HIGH','NORMAL'),
       NULL,
       NULL
FROM (
  SELECT @row:=@row+1 AS id FROM (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15) seq, (SELECT @row:=0) r
) ids
JOIN claimants c ON c.claimant_id = ids.id;

-- Notes for some requests
INSERT IGNORE INTO notes (request_id, claimant_id, author_id, note_text)
SELECT r.request_id, r.claimant_id, (SELECT user_id FROM users WHERE email='a.singh@nis.gov.gy' LIMIT 1),
       CONCAT('Auto-generated note for request ', r.request_number)
FROM requests r
WHERE r.request_id <= 10;

-- Sample documents (dummy file entries)
INSERT IGNORE INTO documents (request_id, file_name, file_path, file_type, file_size, document_category, uploaded_by)
SELECT r.request_id, CONCAT('doc_',r.request_id,'.pdf'), CONCAT('/uploads/doc_',r.request_id,'.pdf'), 'application/pdf', 12345, 'OTHER', (SELECT user_id FROM users ORDER BY user_id LIMIT 1)
FROM requests r
WHERE r.request_id <= 10;

-- Notifications for a few users
INSERT IGNORE INTO notifications (user_id, request_id, notification_type, title, message, delivery_channel, is_sent)
SELECT u.user_id, r.request_id, 'NEW_REQUEST', 'New request created', CONCAT('A new request ', r.request_number, ' was created for claimant ', r.claimant_id), 'IN_APP', TRUE
FROM users u
JOIN requests r ON r.request_id <= 5
WHERE u.user_id <= 5;

SET FOREIGN_KEY_CHECKS=1;


