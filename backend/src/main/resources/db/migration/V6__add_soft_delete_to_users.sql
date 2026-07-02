-- ============================================================================
-- WON-MALLY - Ajout du soft delete sur la table users
-- ============================================================================
ALTER TABLE users
    ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN deleted_at DATETIME NULL;

CREATE INDEX idx_users_deleted ON users(deleted);