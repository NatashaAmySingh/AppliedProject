
-- Create database
CREATE DATABASE IF NOT EXISTS nis_portal
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE nis_portal;

-- REFERENCE TABLES

-- Countries Table
CREATE TABLE countries (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL UNIQUE,
    country_code CHAR(2) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- NIS Office Table 
CREATE TABLE nis_office (
    office_id INT AUTO_INCREMENT PRIMARY KEY,
    office_name VARCHAR(200) NOT NULL,
    country_id INT NOT NULL,
    address TEXT,
    email VARCHAR(255),
    contact_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(country_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Roles Table 
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Benefit Types Table 
CREATE TABLE benefit_types (
    benefit_type_id INT AUTO_INCREMENT PRIMARY KEY,
    benefit_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- USER MANAGEMENT TABLES

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    office_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (office_id) REFERENCES nis_office(office_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- User Sessions Table 
CREATE TABLE user_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_session_user (user_id)
) ENGINE=InnoDB;


-- CORE BUSINESS TABLES

-- Claimants Table 
CREATE TABLE claimants (
    claimant_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    sex ENUM('M', 'F', 'O') NOT NULL,
    nis_number VARCHAR(50),
    national_id VARCHAR(50),
    passport_number VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    contact_number VARCHAR(50),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_claimant_name (last_name, first_name),
    INDEX idx_claimant_nis (nis_number)
) ENGINE=InnoDB;

-- Requests Table 
CREATE TABLE requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(20) NOT NULL UNIQUE,
    claimant_id INT NOT NULL,
    requester_id INT NOT NULL,
    requesting_country_id INT NOT NULL,
    target_country_id INT NOT NULL,
    benefit_type_id INT NOT NULL,
    employment_period VARCHAR(100),
    description TEXT,
    status ENUM('PENDING', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'RESPONDED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    assigned_to INT,
    assigned_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (claimant_id) REFERENCES claimants(claimant_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (requesting_country_id) REFERENCES countries(country_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (target_country_id) REFERENCES countries(country_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (benefit_type_id) REFERENCES benefit_types(benefit_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (assigned_user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_request_status (status),
    INDEX idx_request_claimant (claimant_id)
) ENGINE=InnoDB;

-- Notes Table 
CREATE TABLE notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    claimant_id INT,
    parent_note_id INT NULL,
    author_id INT NOT NULL,
    note_text TEXT NOT NULL,
    edited_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (claimant_id) REFERENCES claimants(claimant_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_note_id) REFERENCES notes(note_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_notes_request (request_id),
    INDEX idx_notes_claimant (claimant_id)
) ENGINE=InnoDB;

-- Documents Table 
CREATE TABLE documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    document_category ENUM('CONTRIBUTION_STATEMENT', 'ID_DOCUMENT', 'CONSENT_FORM', 'CORRESPONDENCE', 'OTHER') DEFAULT 'OTHER',
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_document_request (request_id),
    CONSTRAINT chk_file_size CHECK (file_size > 0)
) ENGINE=InnoDB;

-- Historical Records Table 
CREATE TABLE historical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    claimant_id INT NOT NULL,
    contribution_period_start DATE NOT NULL,
    contribution_period_end DATE NOT NULL,
    employer_name VARCHAR(200),
    contribution_amount DECIMAL(15, 2),
    contribution_weeks INT,
    notes TEXT,
    source_document VARCHAR(255),
    entered_by INT NOT NULL,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claimant_id) REFERENCES claimants(claimant_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_historical_claimant (claimant_id),
    CONSTRAINT chk_period_dates CHECK (contribution_period_end >= contribution_period_start)
) ENGINE=InnoDB;


-- COMMUNICATION TABLE

-- Notifications Table 
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    request_id INT,
    notification_type ENUM('NEW_REQUEST', 'REQUEST_RESPONSE', 'STATUS_CHANGE', 'SYSTEM_ALERT', 'PASSWORD_RESET', 'MFA_CODE', 'ASSIGNMENT') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    delivery_channel ENUM('EMAIL', 'WHATSAPP', 'IN_APP') NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_notification_user (user_id)
) ENGINE=InnoDB;

-- AUDIT AND TRACKING TABLES

-- Audit Logs Table
CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    description TEXT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_action (action_type)
) ENGINE=InnoDB;

-- Request Status History Table 
CREATE TABLE request_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_history_request (request_id)
) ENGINE=InnoDB;


-- INSERT REFERENCE DATA

-- Insert CARICOM Countries
INSERT INTO countries (country_name, country_code) VALUES
('Guyana', 'GY'),
('Trinidad and Tobago', 'TT'),
('Barbados', 'BB'),
('Jamaica', 'JM'),
('Bahamas', 'BS'),
('Belize', 'BZ'),
('Grenada', 'GD'),
('St. Lucia', 'LC'),
('St. Vincent and the Grenadines', 'VC'),
('Antigua and Barbuda', 'AG'),
('Dominica', 'DM'),
('St. Kitts and Nevis', 'KN'),
('Suriname', 'SR'),
('Haiti', 'HT'),
('Montserrat', 'MS');

-- Insert NIS Offices
INSERT INTO nis_office (office_name, country_id, email) VALUES
('National Insurance Scheme (NIS) Guyana', (SELECT country_id FROM countries WHERE country_code = 'GY'), 'info@nis.gov.gy'),
('National Insurance Board (NIB) Trinidad & Tobago', (SELECT country_id FROM countries WHERE country_code = 'TT'), 'info@nibtt.net'),
('National Insurance Scheme (NIS) Barbados', (SELECT country_id FROM countries WHERE country_code = 'BB'), 'info@nis.gov.bb'),
('National Insurance Scheme (NIS) Jamaica', (SELECT country_id FROM countries WHERE country_code = 'JM'), 'info@mlss.gov.jm'),
('National Insurance Board (NIB) Bahamas', (SELECT country_id FROM countries WHERE country_code = 'BS'), 'info@nib-bahamas.com'),
('Social Security Board Belize', (SELECT country_id FROM countries WHERE country_code = 'BZ'), 'info@socialsecurity.org.bz'),
('National Insurance Scheme (NIS) Grenada', (SELECT country_id FROM countries WHERE country_code = 'GD'), 'info@nisgrenada.org'),
('National Insurance Corporation (NIC) St. Lucia', (SELECT country_id FROM countries WHERE country_code = 'LC'), 'info@stlucianic.org'),
('National Insurance Services (NIS) St. Vincent', (SELECT country_id FROM countries WHERE country_code = 'VC'), 'info@nissvg.org'),
('Social Security Board Antigua & Barbuda', (SELECT country_id FROM countries WHERE country_code = 'AG'), 'info@socialsecurity.gov.ag'),
('Dominica Social Security', (SELECT country_id FROM countries WHERE country_code = 'DM'), 'info@dss.dm'),
('Social Security Board St. Kitts & Nevis', (SELECT country_id FROM countries WHERE country_code = 'KN'), 'info@socialsecurity.kn');

-- Insert Roles 
INSERT INTO roles (role_name, role_description, permissions) VALUES
('System Admin', 'System Administrator with full access', 
    '["manage_users", "manage_roles", "manage_offices", "view_all_requests", "manage_settings", "view_audit_logs", "manage_reference_data", "view_reports"]'),
('Caricom Supervisor', 'NIS Guyana CARICOM Unit Supervisor',
    '["create_request", "respond_request", "view_requests", "upload_documents", "download_documents", "approve_historical", "view_reports", "manage_assignments"]'),
('Caricom Clerk', 'NIS Guyana CARICOM Unit Clerk',
    '["create_request", "view_requests", "upload_documents", "download_documents", "enter_historical", "view_claimants"]'),
('External Officer', 'External CARICOM Country Officer',
    '["view_assigned_requests", "respond_request", "upload_documents", "download_documents"]');

-- Insert Benefit Types 
INSERT INTO benefit_types (benefit_name, description) VALUES
('Old Age Pension', 'Retirement pension benefit for eligible contributors'),
('Survivors Pension', 'Benefit paid to survivors of deceased contributors'),
('Invalidity Pension', 'Benefit for contributors who become permanently incapacitated');

-- SAMPLE TEST DATA

-- Create test users (password: Test@123 - bcrypt hash)
INSERT INTO users (first_name, last_name, email, password_hash, role_id, office_id, is_active) VALUES
('System', 'Admin', 'admin@nis.gov.gy', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ELkPqR2qrFfKaW', 1, 1, TRUE),
('Avinash', 'Singh', 'a.singh@nis.gov.gy', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ELkPqR2qrFfKaW', 2, 1, TRUE),
('Maria', 'Persaud', 'clerk1@nis.gov.gy', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ELkPqR2qrFfKaW', 3, 1, TRUE),
('Kevin', 'Johnson', 'k.johnson@nibtt.net', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ELkPqR2qrFfKaW', 4, 2, TRUE),
('Michelle', 'Brown', 'm.brown@nis.gov.bb', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ELkPqR2qrFfKaW', 4, 3, TRUE);

-- Create sample claimants
INSERT INTO claimants (first_name, last_name, date_of_birth, sex, nis_number, national_id, created_by) VALUES
('John', 'Thompson', '1960-03-15', 'M', 'GY-123456789', 'GY-ID-001', 2),
('Maria', 'Garcia', '1958-07-22', 'F', 'GY-987654321', 'GY-ID-002', 2),
('David', 'Williams', '1955-11-30', 'M', 'GY-456789123', 'GY-ID-003', 3);

-- Create sample requests
INSERT INTO requests (request_number, claimant_id, requester_id, requesting_country_id, target_country_id, benefit_type_id, employment_period, status, assigned_to, assigned_user_id) VALUES
('GY-2025-00001', 1, 2, 1, 3, 1, '1985-2000', 'PENDING', NULL, NULL),
('GY-2025-00002', 2, 2, 1, 2, 1, '1990-2010', 'RESPONDED', 4, 4),
('GY-2025-00003', 3, 3, 1, 4, 1, '1980-1995', 'CLOSED', NULL, NULL);

-- Create sample notes
INSERT INTO notes (request_id, author_id, note_text) VALUES
(1, 2, 'Claimant reports working at Barbados Sugar Factory. Please verify employment records.'),
(2, 4, 'Received request. Contribution records verified and attached.'),
(2, 2, 'Thank you for the quick response.');

-- Create sample status history
INSERT INTO request_status_history (request_id, previous_status, new_status, changed_by) VALUES
(1, NULL, 'PENDING', 2),
(2, NULL, 'PENDING', 2),
(2, 'PENDING', 'RESPONDED', 4),
(3, NULL, 'PENDING', 3),
(3, 'PENDING', 'CLOSED', 2);


-- STORED PROCEDURES

DELIMITER //

-- Generate unique request number
CREATE PROCEDURE sp_generate_request_number(
    IN p_country_code CHAR(2),
    OUT p_request_number VARCHAR(20)
)
BEGIN
    DECLARE v_year CHAR(4);
    DECLARE v_sequence INT;
    
    SET v_year = YEAR(CURDATE());
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(request_number, 9) AS UNSIGNED)), 0) + 1
    INTO v_sequence
    FROM requests
    WHERE request_number LIKE CONCAT(p_country_code, '-', v_year, '-%');
    
    SET p_request_number = CONCAT(p_country_code, '-', v_year, '-', LPAD(v_sequence, 5, '0'));
END //

-- Log audit entry
CREATE PROCEDURE sp_log_audit(
    IN p_user_id INT,
    IN p_action_type VARCHAR(50),
    IN p_entity_type VARCHAR(50),
    IN p_entity_id INT,
    IN p_description TEXT,
    IN p_old_values JSON,
    IN p_new_values JSON,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent VARCHAR(500)
)
BEGIN
    INSERT INTO audit_logs (
        user_id, action_type, entity_type, entity_id, 
        description, old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action_type, p_entity_type, p_entity_id,
        p_description, p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END //

-- Update request status with history tracking
CREATE PROCEDURE sp_update_request_status(
    IN p_request_id INT,
    IN p_new_status VARCHAR(50),
    IN p_changed_by INT
)
BEGIN
    DECLARE v_current_status VARCHAR(50);
    
    SELECT status INTO v_current_status
    FROM requests WHERE request_id = p_request_id;
    
    UPDATE requests 
    SET status = p_new_status
    WHERE request_id = p_request_id;
    
    INSERT INTO request_status_history (
        request_id, previous_status, new_status, changed_by
    ) VALUES (
        p_request_id, v_current_status, p_new_status, p_changed_by
    );
END //

-- Clean expired sessions
CREATE PROCEDURE sp_cleanup_expired_sessions()
BEGIN
    UPDATE user_sessions 
    SET is_valid = FALSE 
    WHERE expires_at < NOW() AND is_valid = TRUE;
    
    DELETE FROM user_sessions 
    WHERE is_valid = FALSE AND expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //

DELIMITER ;

-- VIEWS

-- Request Summary View (for Dashboard)
CREATE OR REPLACE VIEW vw_request_summary AS
SELECT 
    r.request_id,
    r.request_number,
    CONCAT(c.first_name, ' ', c.last_name) AS claimant_name,
    oc.country_name AS requesting_country,
    tc.country_name AS target_country,
    bt.benefit_name,
    r.status,
    r.priority,
    r.created_at,
    CONCAT(u.first_name, ' ', u.last_name) AS requester_name,
    CONCAT(au.first_name, ' ', au.last_name) AS assigned_to_name
FROM requests r
JOIN claimants c ON r.claimant_id = c.claimant_id
JOIN countries oc ON r.requesting_country_id = oc.country_id
JOIN countries tc ON r.target_country_id = tc.country_id
JOIN benefit_types bt ON r.benefit_type_id = bt.benefit_type_id
JOIN users u ON r.requester_id = u.user_id
LEFT JOIN users au ON COALESCE(r.assigned_user_id, r.assigned_to) = au.user_id;

-- User Activity View
CREATE OR REPLACE VIEW vw_user_activity AS
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.email,
    r.role_name,
    o.office_name,
    c.country_name,
    u.last_login,
    u.is_active,
    (SELECT COUNT(*) FROM requests WHERE requester_id = u.user_id) AS requests_created,
    (SELECT COUNT(*) FROM requests WHERE (assigned_to = u.user_id OR assigned_user_id = u.user_id) AND status NOT IN ('CLOSED', 'CANCELLED')) AS pending_assignments
FROM users u
JOIN roles r ON u.role_id = r.role_id
JOIN nis_office o ON u.office_id = o.office_id
JOIN countries c ON o.country_id = c.country_id;

SELECT
    r.request_id,
    r.status,
    r.created_at,
    CONCAT(c.first_name, ' ', c.last_name) AS claimant_name,
    c.date_of_birth AS claimant_dob,
    c.national_id,
    co.country_name AS target_country,
    b.benefit_name
FROM requests r
JOIN claimants c ON r.claimant_id = c.claimant_id
LEFT JOIN countries co ON r.target_country_id = co.country_id
LEFT JOIN benefit_types b ON r.benefit_type_id = b.benefit_type_id
ORDER BY r.created_at DESC;
 

-- END OF DATABASE SCRIPT
