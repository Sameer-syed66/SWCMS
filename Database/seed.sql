USE swcms;

-- =========================================================
-- SWCMS INITIAL SEED DATA
-- Default Passwords:
--   Administrator: admin / Admin@123
--   Authority:     authority1, authority2, authority3 / Authority@123
-- =========================================================

-- 1. ADMINISTRATOR
INSERT INTO administrators (username, password_hash, full_name, email)
VALUES (
    'admin',
    'scrypt:32768:8:1$f0o75MKrF72RDtzW$fa5b63a4e487da402272d6d1c0e396125beb317e7975aef302b4c56b4fc0e9e65e261d7a424c11194946136303541cc6c0e38e340c4e73b660a4964bffb59f3a',
    'System Administrator',
    'admin@swcms.com'
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 2. AUTHORITIES
INSERT INTO authorities (username, password_hash, full_name, email, phone, area, status)
VALUES 
(
    'authority1',
    'scrypt:32768:8:1$jVEdSNDWI7yv9JCm$d44bd49c5139028d4dd37bc3ab255a202ddf22d48f204f021f15a4db045c7949c9a4895c849bb39099dc4357a1f02f21bac7a6caef808a8286dd985bc25c7025',
    'Rahul Kumar',
    'rahul@swcms.com',
    '9876543210',
    'Central Zone',
    'ACTIVE'
),
(
    'authority2',
    'scrypt:32768:8:1$jVEdSNDWI7yv9JCm$d44bd49c5139028d4dd37bc3ab255a202ddf22d48f204f021f15a4db045c7949c9a4895c849bb39099dc4357a1f02f21bac7a6caef808a8286dd985bc25c7025',
    'Arun Joseph',
    'arun@swcms.com',
    '9876543211',
    'North Zone',
    'ACTIVE'
),
(
    'authority3',
    'scrypt:32768:8:1$jVEdSNDWI7yv9JCm$d44bd49c5139028d4dd37bc3ab255a202ddf22d48f204f021f15a4db045c7949c9a4895c849bb39099dc4357a1f02f21bac7a6caef808a8286dd985bc25c7025',
    'Vishnu Raj',
    'vishnu@swcms.com',
    '9876543212',
    'South Zone',
    'ACTIVE'
) ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 3. GARBAGE BINS
INSERT INTO garbage_bins (bin_code, location, area, latitude, longitude, capacity, current_level, warning_threshold, critical_threshold, status, operational_status)
VALUES
('BIN-001', 'Main Bus Stand',       'Central Zone', 9.5380, 76.8200, 100, 25.00, 70.00, 85.00, 'NORMAL', 'ACTIVE'),
('BIN-002', 'Central Market',       'Central Zone', 9.5400, 76.8220, 100, 45.00, 70.00, 85.00, 'NORMAL', 'ACTIVE'),
('BIN-003', 'Municipal Office',     'Central Zone', 9.5420, 76.8240, 100, 58.00, 70.00, 85.00, 'NORMAL', 'ACTIVE'),
('BIN-004', 'Railway Station',      'North Zone',   9.5440, 76.8260, 100, 72.00, 70.00, 85.00, 'WARNING', 'ACTIVE'),
('BIN-005', 'Government Hospital',  'North Zone',   9.5460, 76.8280, 100, 81.00, 70.00, 85.00, 'WARNING', 'ACTIVE'),
('BIN-006', 'College Junction',     'North Zone',   9.5480, 76.8300, 100, 88.00, 70.00, 85.00, 'FULL', 'ACTIVE'),
('BIN-007', 'Shopping Complex',     'South Zone',   9.5500, 76.8320, 100, 93.00, 70.00, 85.00, 'FULL', 'ACTIVE'),
('BIN-008', 'Residential Area A',   'South Zone',   9.5520, 76.8340, 100, 96.00, 70.00, 85.00, 'FULL', 'ACTIVE'),
('BIN-009', 'Residential Area B',   'South Zone',   9.5540, 76.8360, 100, 67.00, 70.00, 85.00, 'NORMAL', 'ACTIVE'),
('BIN-010', 'Town Park',            'Central Zone', 9.5560, 76.8380, 100, 35.00, 70.00, 85.00, 'NORMAL', 'ACTIVE')
ON DUPLICATE KEY UPDATE current_level = VALUES(current_level);

-- 4. ALERTS
INSERT INTO alerts (bin_id, alert_type, message, waste_level, priority, status)
VALUES
(6, 'HIGH_WASTE_LEVEL', 'Bin BIN-006 reached 88% capacity and crossed critical threshold.', 88.00, 'HIGH', 'PENDING'),
(7, 'FULL_BIN', 'Bin BIN-007 reached 93% capacity and requires urgent collection.', 93.00, 'CRITICAL', 'PENDING'),
(8, 'FULL_BIN', 'Bin BIN-008 reached 96% capacity and requires immediate collection.', 96.00, 'CRITICAL', 'PENDING');

-- 5. COMPLAINTS
INSERT INTO complaints (complaint_code, citizen_name, citizen_email, citizen_phone, category, description, location, bin_id, status)
VALUES
('CMP-2026-001', 'Akhil Menon', 'akhil@example.com', '9876500001', 'Overflowing Garbage', 'Garbage has not been collected for two days and is overflowing on the pavement.', 'Central Market', 2, 'PENDING'),
('CMP-2026-002', 'Anjali Nair', 'anjali@example.com', '9876500002', 'Bad Odor', 'Severe foul odor originating from uncleaned waste bins near residential gate.', 'Residential Area B', 9, 'IN_PROGRESS'),
('CMP-2026-003', 'Rahul Das',   'rahul@example.com', '9876500003', 'Damaged Bin', 'Bin lid is completely broken and waste is spilling out into the bus stop area.', 'Main Bus Stand', 1, 'RESOLVED');

-- 6. COLLECTION HISTORY
INSERT INTO collection_history (bin_id, authority_id, collected_level, remarks)
VALUES
(1, 1, 92.00, 'Morning routine collection completed successfully.'),
(2, 1, 95.00, 'Commercial area bin emptied and disinfected.'),
(3, 2, 87.00, 'Municipal office bin cleared before afternoon peak.');

-- 7. NOTIFICATIONS
INSERT INTO notifications (authority_id, title, message, priority, is_read)
VALUES
(NULL, 'Critical Waste Alert', 'Bin BIN-008 has reached 96% capacity in South Zone.', 'HIGH', FALSE),
(NULL, 'Critical Waste Alert', 'Bin BIN-007 has reached 93% capacity in South Zone.', 'HIGH', FALSE),
(NULL, 'New Citizen Complaint', 'New complaint CMP-2026-001 submitted for Central Market.', 'NORMAL', FALSE);