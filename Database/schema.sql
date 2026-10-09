-- =========================================================
-- SWCMS DATABASE SCHEMA
-- Smart Waste Collection and Monitoring System
-- =========================================================

CREATE DATABASE IF NOT EXISTS swcms;

USE swcms;


-- =========================================================
-- 1. ADMINISTRATORS
-- =========================================================

CREATE TABLE administrators (
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

CREATE TABLE authorities (
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

CREATE TABLE garbage_bins (
    bin_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_code VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    capacity INT DEFAULT 100,

    current_level DECIMAL(5,2) DEFAULT 0,

    status ENUM(
        'NORMAL',
        'WARNING',
        'FULL',
        'COLLECTED'
    ) DEFAULT 'NORMAL',

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 4. WASTE LEVEL RECORDS
-- =========================================================

CREATE TABLE waste_level_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,

    bin_id INT NOT NULL,

    waste_level DECIMAL(5,2) NOT NULL,

    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_waste_bin
        FOREIGN KEY (bin_id)
        REFERENCES garbage_bins(bin_id)
        ON DELETE CASCADE
);


-- =========================================================
-- 5. ALERTS
-- =========================================================

CREATE TABLE alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,

    bin_id INT NOT NULL,

    alert_type VARCHAR(50) NOT NULL,

    message VARCHAR(255) NOT NULL,

    priority ENUM(
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    ) DEFAULT 'MEDIUM',

    status ENUM(
        'PENDING',
        'ASSIGNED',
        'RESOLVED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    resolved_at TIMESTAMP NULL,

    CONSTRAINT fk_alert_bin
        FOREIGN KEY (bin_id)
        REFERENCES garbage_bins(bin_id)
        ON DELETE CASCADE
);


-- =========================================================
-- 6. COMPLAINTS
-- =========================================================

CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,

    complaint_code VARCHAR(50) NOT NULL UNIQUE,

    citizen_name VARCHAR(100) NOT NULL,

    citizen_email VARCHAR(100),

    description TEXT NOT NULL,

    location VARCHAR(255) NOT NULL,

    status ENUM(
        'PENDING',
        'IN_PROGRESS',
        'RESOLVED',
        'REJECTED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    resolved_at TIMESTAMP NULL
);


-- =========================================================
-- 7. COLLECTION HISTORY
-- =========================================================

CREATE TABLE collection_history (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,

    bin_id INT NOT NULL,

    authority_id INT,

    collected_level DECIMAL(5,2),

    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    remarks VARCHAR(255),

    CONSTRAINT fk_collection_bin
        FOREIGN KEY (bin_id)
        REFERENCES garbage_bins(bin_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_collection_authority
        FOREIGN KEY (authority_id)
        REFERENCES authorities(authority_id)
        ON DELETE SET NULL
);


-- =========================================================
-- 8. NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,

    authority_id INT,

    title VARCHAR(150) NOT NULL,

    message VARCHAR(255) NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_authority
        FOREIGN KEY (authority_id)
        REFERENCES authorities(authority_id)
        ON DELETE CASCADE
);