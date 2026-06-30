-- ============================================================================
-- WON-MALLY - SEED DES UTILISATEURS DE TEST PAR DEFAUT
-- Permet de se connecter avec les differents roles de la plateforme.
-- ============================================================================

-- 1. Centre Medical par defaut
INSERT INTO medical_centers (id, name, email, phone, address, latitude, longitude, emergency_capacity, active)
VALUES (
    'c3b07384-d113-49d8-849c-d6b866660002',
    'CHU Donka',
    'contact@chu-donka.gn',
    '+224622000000',
    'Dixinn, Conakry, Guinée',
    9.54280000,
    -13.67140000,
    50,
    TRUE
);

-- 2. Ambulance par defaut
INSERT INTO ambulances (id, registration_number, model, status, medical_center_id, gps_latitude, gps_longitude)
VALUES (
    'a3b07384-d113-49d8-849c-d6b866660003',
    'RC-1234-A',
    'Toyota Land Cruiser Ambulance',
    'AVAILABLE',
    'c3b07384-d113-49d8-849c-d6b866660002',
    9.54280000,
    -13.67140000
);

-- 3. Utilisateurs de test (Mot de passe pour tous : admin123)
-- Hash BCrypt genere : $2a$10$tZ8O5.vXvEwS1aYI2G0kEuYdUpwXv3jO9bB4lqA0mK7G8G/5p7UuG
INSERT INTO users (id, first_name, last_name, email, phone, password, enabled, verified, created_at, updated_at)
VALUES 
('d3b07384-d113-49d8-849c-d6b866660001', 'Super', 'Admin', 'admin@wonmally.com', '+224600000001', '$2a$10$tZ8O5.vXvEwS1aYI2G0kEuYdUpwXv3jO9bB4lqA0mK7G8G/5p7UuG', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d3b07384-d113-49d8-849c-d6b866660002', 'Jean', 'Dupont', 'citizen@wonmally.com', '+224600000002', '$2a$10$tZ8O5.vXvEwS1aYI2G0kEuYdUpwXv3jO9bB4lqA0mK7G8G/5p7UuG', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d3b07384-d113-49d8-849c-d6b866660003', 'Marie', 'Curie', 'regulateur@wonmally.com', '+224600000003', '$2a$10$tZ8O5.vXvEwS1aYI2G0kEuYdUpwXv3jO9bB4lqA0mK7G8G/5p7UuG', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d3b07384-d113-49d8-849c-d6b866660004', 'Pierre', 'Calmet', 'medecin@wonmally.com', '+224600000004', '$2a$10$tZ8O5.vXvEwS1aYI2G0kEuYdUpwXv3jO9bB4lqA0mK7G8G/5p7UuG', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d3b07384-d113-49d8-849c-d6b866660005', 'Thomas', 'Ranger', 'ambulancier@wonmally.com', '+224600000005', '$2a$10$tZ8O5.vXvEwS1aYI2G0kEuYdUpwXv3jO9bB4lqA0mK7G8G/5p7UuG', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Association des roles
INSERT INTO user_roles (user_id, role_id) VALUES
('d3b07384-d113-49d8-849c-d6b866660001', (SELECT id FROM roles WHERE name = 'ADMIN')),
('d3b07384-d113-49d8-849c-d6b866660002', (SELECT id FROM roles WHERE name = 'CITIZEN')),
('d3b07384-d113-49d8-849c-d6b866660003', (SELECT id FROM roles WHERE name = 'MEDICAL_CENTER')),
('d3b07384-d113-49d8-849c-d6b866660004', (SELECT id FROM roles WHERE name = 'DOCTOR')),
('d3b07384-d113-49d8-849c-d6b866660005', (SELECT id FROM roles WHERE name = 'AMBULANCIER'));

-- 5. Profils specifiques des roles

-- Citoyen
INSERT INTO citizens (id, user_id, address, blood_group, emergency_contact, preferred_language)
VALUES (
    'e3b07384-d113-49d8-849c-d6b866660002',
    'd3b07384-d113-49d8-849c-d6b866660002',
    'Conakry, Guinée',
    'O+',
    '+224622111222',
    'fr'
);

-- Medecin
INSERT INTO doctors (id, user_id, medical_center_id, specialty, license_number, available, status)
VALUES (
    'f3b07384-d113-49d8-849c-d6b866660004',
    'd3b07384-d113-49d8-849c-d6b866660004',
    'c3b07384-d113-49d8-849c-d6b866660002',
    'Urgentiste',
    'LIC-DOC-9999',
    TRUE,
    'OFF_DUTY'
);

-- Ambulancier
INSERT INTO ambulanciers (id, user_id, medical_center_id, matricule, available, current_status)
VALUES (
    'b3b07384-d113-49d8-849c-d6b866660005',
    'd3b07384-d113-49d8-849c-d6b866660005',
    'c3b07384-d113-49d8-849c-d6b866660002',
    'MAT-AMB-7777',
    TRUE,
    'OFF_DUTY'
);
