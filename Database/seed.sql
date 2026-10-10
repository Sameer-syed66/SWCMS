USE swcms;

-- =========================================================
-- SWCMS INITIAL SEED DATA
-- =========================================================

-- =========================================================
-- 1. ADMINISTRATOR
-- =========================================================

INSERT INTO administrators
(username, password_hash, full_name, email)
VALUES
(
    'admin',
    'scrypt:32768:8:1$az21PxuKHvCkqAcl$5bd0b748866d0835d6ac671c40e0f4efe4eacb2757ec051a119548a8720d10c16263ec03649f44ef999c6c62597708f31df2cfe4e7183ad37c52f2d4fb47bac2',
    'System Administrator',
    'admin@swcms.com'
);


-- =========================================================
-- 2. AUTHORITIES
-- =========================================================

INSERT INTO authorities
(username, password_hash, full_name, email, phone, area, status)
VALUES
(
    'authority1',
    'scrypt:32768:8:1$fRNjlUoLJVPPN7yd$2da92400ea7a2f0043aa9ac53328b62b05191ee3cd8a579344bd029b7d0ac4a01f519e8b1ca110441081a4717d8753a0aaaef4d9c1e4ed6eafc65b4b40907d97',
    'Rahul Kumar',
    'rahul@swcms.com',
    '9876543210',
    'Central Zone',
    'ACTIVE'
),
(
    'authority2',
    'scrypt:32768:8:1$fRNjlUoLJVPPN7yd$2da92400ea7a2f0043aa9ac53328b62b05191ee3cd8a579344bd029b7d0ac4a01f519e8b1ca110441081a4717d8753a0aaaef4d9c1e4ed6eafc65b4b40907d97',
    'Arun Joseph',
    'arun@swcms.com',
    '9876543211',
    'North Zone',
    'ACTIVE'
),
(
    'authority3',
    'scrypt:32768:8:1$fRNjlUoLJVPPN7yd$2da92400ea7a2f0043aa9ac53328b62b05191ee3cd8a579344bd029b7d0ac4a01f519e8b1ca110441081a4717d8753a0aaaef4d9c1e4ed6eafc65b4b40907d97',
    'Vishnu Raj',
    'vishnu@swcms.com',
    '9876543212',
    'South Zone',
    'ACTIVE'
);


-- =========================================================
-- 3. GARBAGE BINS
-- =========================================================

INSERT INTO garbage_bins
(bin_code, location, latitude, longitude, capacity, current_level, status)
VALUES
('BIN-001', 'Main Bus Stand',       9.5380, 76.8200, 100, 25.00, 'NORMAL'),
('BIN-002', 'Central Market',       9.5400, 76.8220, 100, 45.00, 'NORMAL'),
('BIN-003', 'Municipal Office',     9.5420, 76.8240, 100, 58.00, 'NORMAL'),
('BIN-004', 'Railway Station',      9.5440, 76.8260, 100, 72.00, 'WARNING'),
('BIN-005', 'Government Hospital',  9.5460, 76.8280, 100, 81.00, 'WARNING'),
('BIN-006', 'College Junction',     9.5480, 76.8300, 100, 88.00, 'WARNING'),
('BIN-007', 'Shopping Complex',     9.5500, 76.8320, 100, 93.00, 'FULL'),
('BIN-008', 'Residential Area A',   9.5520, 76.8340, 100, 96.00, 'FULL'),
('BIN-009', 'Residential Area B',   9.5540, 76.8360, 100, 67.00, 'NORMAL'),
('BIN-010', 'Town Park',            9.5560, 76.8380, 100, 35.00, 'NORMAL');


-- =========================================================
-- 4. WASTE LEVEL RECORDS
-- =========================================================

INSERT INTO waste_level_records
(bin_id, waste_level)
VALUES
(1, 25.00),
(2, 45.00),
(3, 58.00),
(4, 72.00),
(5, 81.00),
(6, 88.00),
(7, 93.00),
(8, 96.00),
(9, 67.00),
(10, 35.00);


-- =========================================================
-- 5. ALERTS
-- =========================================================

INSERT INTO alerts
(bin_id, alert_type, message, priority, status)
VALUES
(
    4,
    'HIGH_WASTE_LEVEL',
    'Bin BIN-004 has reached 72% capacity.',
    'HIGH',
    'PENDING'
),
(
    5,
    'HIGH_WASTE_LEVEL',
    'Bin BIN-005 has reached 81% capacity.',
    'HIGH',
    'PENDING'
),
(
    6,
    'HIGH_WASTE_LEVEL',
    'Bin BIN-006 has reached 88% capacity.',
    'HIGH',
    'PENDING'
),
(
    7,
    'FULL_BIN',
    'Bin BIN-007 has reached 93% capacity and requires collection.',
    'CRITICAL',
    'PENDING'
),
(
    8,
    'FULL_BIN',
    'Bin BIN-008 has reached 96% capacity and requires immediate collection.',
    'CRITICAL',
    'PENDING'
);


-- =========================================================
-- 6. COMPLAINTS
-- =========================================================

INSERT INTO complaints
(complaint_code, citizen_name, citizen_email, description, location, status)
VALUES
(
    'CMP-001',
    'Akhil Menon',
    'akhil@example.com',
    'Garbage has not been collected for several days.',
    'Central Market',
    'PENDING'
),
(
    'CMP-002',
    'Anjali Nair',
    'anjali@example.com',
    'Overflowing waste bin near residential area.',
    'Residential Area B',
    'IN_PROGRESS'
),
(
    'CMP-003',
    'Rahul Das',
    'rahul@example.com',
    'Waste accumulation near the bus stand.',
    'Main Bus Stand',
    'RESOLVED'
);


-- =========================================================
-- 7. COLLECTION HISTORY
-- =========================================================

INSERT INTO collection_history
(bin_id, authority_id, collected_level, remarks)
VALUES
(
    1,
    1,
    92.00,
    'Bin emptied successfully.'
),
(
    2,
    2,
    95.00,
    'Routine waste collection completed.'
),
(
    3,
    3,
    87.00,
    'Waste collected successfully.'
);


-- =========================================================
-- 8. NOTIFICATIONS
-- =========================================================

INSERT INTO notifications
(authority_id, title, message, is_read)
VALUES
(
    1,
    'High Waste Level',
    'BIN-004 requires attention.',
    FALSE
),
(
    2,
    'Critical Bin Alert',
    'BIN-007 requires immediate collection.',
    FALSE
),
(
    3,
    'Critical Bin Alert',
    'BIN-008 requires immediate collection.',
    FALSE
);