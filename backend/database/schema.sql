-- =========================================================
-- SWCMS DATABASE SCHEMA
-- Smart Waste Collection and Monitoring System
-- =========================================================

CREATE DATABASE IF NOT EXISTS swcms;
USE swcms;

-- =========================================================
-- 1. ADMINISTRATORS
-- =========================================================
CREATE TABLE IF NOT EXISTS administrators (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 2. AUTHORITIES
-- =========================================================
CREATE TABLE IF NOT EXISTS authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    area VARCHAR(100),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 3. GARBAGE BINS
-- =========================================================
CREATE TABLE IF NOT EXISTS garbage_bins (
    bin_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_code VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    area VARCHAR(100) DEFAULT 'Central Zone',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    capacity INT DEFAULT 100,
    current_level DECIMAL(5,2) DEFAULT 0,
    warning_threshold DECIMAL(5,2) DEFAULT 70.00,
    critical_threshold DECIMAL(5,2) DEFAULT 85.00,
    status ENUM('NORMAL', 'WARNING', 'FULL', 'COLLECTED') DEFAULT 'NORMAL',
    operational_status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 4. WASTE LEVEL RECORDS
-- =========================================================
CREATE TABLE IF NOT EXISTS waste_level_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_id INT NOT NULL,
    waste_level DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_waste_bin FOREIGN KEY (bin_id) REFERENCES garbage_bins(bin_id) ON DELETE CASCADE
);

-- =========================================================
-- 5. ALERTS
-- =========================================================
CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_id INT NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message VARCHAR(255) NOT NULL,
    waste_level DECIMAL(5,2) DEFAULT 0,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'ASSIGNED', 'RESOLVED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_alert_bin FOREIGN KEY (bin_id) REFERENCES garbage_bins(bin_id) ON DELETE CASCADE
);

-- =========================================================
-- 6. COMPLAINTS
-- =========================================================
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_code VARCHAR(50) NOT NULL UNIQUE,
    citizen_name VARCHAR(100) NOT NULL,
    citizen_email VARCHAR(100),
    citizen_phone VARCHAR(20),
    category VARCHAR(50) NOT NULL DEFAULT 'Overflowing Garbage',
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    bin_id INT NULL,
    assigned_authority_id INT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING',
    resolution_remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_complaint_bin FOREIGN KEY (bin_id) REFERENCES garbage_bins(bin_id) ON DELETE SET NULL,
    CONSTRAINT fk_complaint_authority FOREIGN KEY (assigned_authority_id) REFERENCES authorities(authority_id) ON DELETE SET NULL
);

-- =========================================================
-- 7. COLLECTION HISTORY
-- =========================================================
CREATE TABLE IF NOT EXISTS collection_history (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_id INT NOT NULL,
    authority_id INT NULL,
    collected_level DECIMAL(5,2),
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    related_alert_id INT NULL,
    CONSTRAINT fk_collection_bin FOREIGN KEY (bin_id) REFERENCES garbage_bins(bin_id) ON DELETE CASCADE,
    CONSTRAINT fk_collection_authority FOREIGN KEY (authority_id) REFERENCES authorities(authority_id) ON DELETE SET NULL
);

-- =========================================================
-- 8. NOTIFICATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    authority_id INT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_authority FOREIGN KEY (authority_id) REFERENCES authorities(authority_id) ON DELETE CASCADE
);

-- =========================================================
-- 9. SYSTEM SETTINGS
-- =========================================================
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
    ('default_warning_threshold', '70', 'Default warning threshold percentage for bins'),
    ('default_critical_threshold', '85', 'Default critical threshold percentage for bins'),
    ('response_sla_hours', '24', 'Citizen complaint target resolution time in hours')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
