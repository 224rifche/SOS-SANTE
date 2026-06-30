-- ============================================================================
-- WON-MALLY - MODELE PHYSIQUE DES DONNEES (MPD)
-- Plateforme intelligente de gestion des urgences medicales
-- Base : MySQL 8.0+ (InnoDB, utf8mb4)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS wonmally_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE wonmally_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. USER
-- ============================================================================
CREATE TABLE users (
    id              CHAR(36)        NOT NULL PRIMARY KEY,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     NULL,
    password        VARCHAR(255)    NOT NULL,
    profile_picture VARCHAR(255)    NULL,
    enabled         BOOLEAN         NOT NULL DEFAULT TRUE,
    verified        BOOLEAN         NOT NULL DEFAULT FALSE,
    last_login      DATETIME        NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- ============================================================================
-- 2. ROLE
-- ============================================================================
CREATE TABLE roles (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NULL,
    CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB;

-- ============================================================================
-- 3. PERMISSION
-- ============================================================================
CREATE TABLE permissions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(100) NOT NULL,
    label       VARCHAR(255) NOT NULL,
    description TEXT NULL,
    CONSTRAINT uq_permissions_code UNIQUE (code)
) ENGINE=InnoDB;

-- ============================================================================
-- 4. USER_ROLE (N:N)
-- ============================================================================
CREATE TABLE user_roles (
    user_id CHAR(36) NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 5. ROLE_PERMISSION (N:N)
-- ============================================================================
CREATE TABLE role_permissions (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 6. CITIZEN
-- ============================================================================
CREATE TABLE citizens (
    id                  CHAR(36) NOT NULL PRIMARY KEY,
    user_id             CHAR(36) NOT NULL,
    address             TEXT NULL,
    blood_group         VARCHAR(5) NULL,
    emergency_contact   VARCHAR(20) NULL,
    preferred_language  VARCHAR(50) NULL,
    CONSTRAINT uq_citizens_user UNIQUE (user_id),
    CONSTRAINT fk_citizens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 7. MEDICAL_CENTER
-- ============================================================================
CREATE TABLE medical_centers (
    id                  CHAR(36) NOT NULL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    address             TEXT NOT NULL,
    latitude            DECIMAL(10,8) NULL,
    longitude           DECIMAL(11,8) NULL,
    emergency_capacity  INTEGER NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_medical_centers_email UNIQUE (email)
) ENGINE=InnoDB;

-- ============================================================================
-- 8. DOCTOR
-- ============================================================================
CREATE TABLE doctors (
    id                  CHAR(36) NOT NULL PRIMARY KEY,
    user_id             CHAR(36) NOT NULL,
    medical_center_id   CHAR(36) NOT NULL,
    specialty           VARCHAR(100) NOT NULL,
    license_number      VARCHAR(100) NOT NULL,
    available           BOOLEAN NOT NULL DEFAULT TRUE,
    status              VARCHAR(50) NOT NULL DEFAULT 'OFF_DUTY',
    CONSTRAINT uq_doctors_user UNIQUE (user_id),
    CONSTRAINT uq_doctors_license UNIQUE (license_number),
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_doctors_medical_center FOREIGN KEY (medical_center_id) REFERENCES medical_centers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 9. AMBULANCIER
-- ============================================================================
CREATE TABLE ambulanciers (
    id                  CHAR(36) NOT NULL PRIMARY KEY,
    user_id             CHAR(36) NOT NULL,
    medical_center_id   CHAR(36) NOT NULL,
    matricule           VARCHAR(50) NOT NULL,
    available           BOOLEAN NOT NULL DEFAULT TRUE,
    current_status      VARCHAR(50) NOT NULL DEFAULT 'OFF_DUTY',
    CONSTRAINT uq_ambulanciers_user UNIQUE (user_id),
    CONSTRAINT uq_ambulanciers_matricule UNIQUE (matricule),
    CONSTRAINT fk_ambulanciers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ambulanciers_medical_center FOREIGN KEY (medical_center_id) REFERENCES medical_centers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 10. AMBULANCE
-- ============================================================================
CREATE TABLE ambulances (
    id                      CHAR(36) NOT NULL PRIMARY KEY,
    registration_number     VARCHAR(50) NOT NULL,
    model                   VARCHAR(100) NOT NULL,
    status                  VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    medical_center_id       CHAR(36) NOT NULL,
    gps_latitude            DECIMAL(10,8) NULL,
    gps_longitude           DECIMAL(11,8) NULL,
    CONSTRAINT uq_ambulances_registration UNIQUE (registration_number),
    CONSTRAINT fk_ambulances_medical_center FOREIGN KEY (medical_center_id) REFERENCES medical_centers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 11. EMERGENCY_CATEGORY
-- ============================================================================
CREATE TABLE emergency_categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    priority    INTEGER NOT NULL,
    description TEXT NULL,
    CONSTRAINT uq_emergency_categories_name UNIQUE (name)
) ENGINE=InnoDB;

-- ============================================================================
-- 12. LOCATION
-- ============================================================================
CREATE TABLE locations (
    id          CHAR(36) NOT NULL PRIMARY KEY,
    latitude    DECIMAL(10,8) NOT NULL,
    longitude   DECIMAL(11,8) NOT NULL,
    address     TEXT NULL,
    source      VARCHAR(50) NOT NULL DEFAULT 'GPS',
    accuracy    DECIMAL(10,2) NULL
) ENGINE=InnoDB;

-- ============================================================================
-- 13. ALERT
-- ============================================================================
CREATE TABLE alerts (
    id          CHAR(36) NOT NULL PRIMARY KEY,
    citizen_id  CHAR(36) NOT NULL,
    category_id BIGINT NOT NULL,
    location_id CHAR(36) NOT NULL,
    description TEXT NULL,
    priority    INTEGER NOT NULL DEFAULT 3,
    status      VARCHAR(50) NOT NULL DEFAULT 'ALERTE_CREEE',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_alerts_location UNIQUE (location_id),
    CONSTRAINT fk_alerts_citizen FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_category FOREIGN KEY (category_id) REFERENCES emergency_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_alerts_status CHECK (status IN (
        'ALERTE_CREEE','EN_ATTENTE_VALIDATION','VALIDEE','AMBULANCE_AFFECTEE',
        'AMBULANCE_EN_ROUTE','ARRIVEE_SUR_LES_LIEUX','PATIENT_PRIS_EN_CHARGE',
        'TRANSPORT_VERS_CENTRE','ARRIVEE_AUX_URGENCES','MEDECIN_ASSIGNE',
        'PRISE_EN_CHARGE_MEDICALE_EN_COURS','PRISE_EN_CHARGE_MEDICALE_TERMINEE',
        'INTERVENTION_CLOTUREE','ARCHIVEE','REJETEE'
    ))
) ENGINE=InnoDB;

CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_citizen ON alerts(citizen_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- ============================================================================
-- 14. INTERVENTION
-- ============================================================================
CREATE TABLE interventions (
    id                  CHAR(36) NOT NULL PRIMARY KEY,
    alert_id            CHAR(36) NOT NULL,
    medical_center_id   CHAR(36) NOT NULL,
    ambulance_id        CHAR(36) NULL,
    doctor_id           CHAR(36) NULL,
    current_status      VARCHAR(50) NOT NULL DEFAULT 'ALERTE_CREEE',
    started_at          DATETIME NULL,
    completed_at        DATETIME NULL,
    archived            BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_interventions_alert UNIQUE (alert_id),
    CONSTRAINT fk_interventions_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_interventions_medical_center FOREIGN KEY (medical_center_id) REFERENCES medical_centers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_interventions_ambulance FOREIGN KEY (ambulance_id) REFERENCES ambulances(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_interventions_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_interventions_status ON interventions(current_status);
CREATE INDEX idx_interventions_medical_center ON interventions(medical_center_id);

-- ============================================================================
-- 15. MEDICAL_NOTE
-- ============================================================================
CREATE TABLE medical_notes (
    id              CHAR(36) NOT NULL PRIMARY KEY,
    intervention_id CHAR(36) NOT NULL,
    doctor_id       CHAR(36) NOT NULL,
    diagnosis       TEXT NULL,
    observations    TEXT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_notes_intervention FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_medical_notes_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 16. VOICE_NOTE
-- ============================================================================
CREATE TABLE voice_notes (
    id          CHAR(36) NOT NULL PRIMARY KEY,
    alert_id    CHAR(36) NOT NULL,
    file_path   VARCHAR(255) NOT NULL,
    duration    INTEGER NULL,
    language    VARCHAR(50) NULL,
    CONSTRAINT fk_voice_notes_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 17. ATTACHMENT
-- ============================================================================
CREATE TABLE attachments (
    id          CHAR(36) NOT NULL PRIMARY KEY,
    alert_id    CHAR(36) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_type   VARCHAR(100) NOT NULL,
    file_size   BIGINT NOT NULL,
    file_path   VARCHAR(255) NOT NULL,
    CONSTRAINT fk_attachments_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 18. NOTIFICATION
-- ============================================================================
CREATE TABLE notifications (
    id          CHAR(36) NOT NULL PRIMARY KEY,
    user_id     CHAR(36) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(50) NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- ============================================================================
-- 19. AUDIT_LOG
-- ============================================================================
CREATE TABLE audit_logs (
    id          CHAR(36) NOT NULL PRIMARY KEY,
    user_id     CHAR(36) NULL,
    action      VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id   CHAR(36) NULL,
    ip_address  VARCHAR(100) NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 20. REFRESH_TOKEN
-- ============================================================================
CREATE TABLE refresh_tokens (
    id              CHAR(36) NOT NULL PRIMARY KEY,
    user_id         CHAR(36) NOT NULL,
    token           VARCHAR(512) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_refresh_tokens_token UNIQUE (token),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
