-- ============================================================================
-- V4 - CHAMPS DE SECURITE : protection brute force + hash refresh token
-- ============================================================================

-- Champs de protection brute force sur la table users
ALTER TABLE users
    ADD COLUMN failed_login_attempts INT          NOT NULL DEFAULT 0        AFTER verified,
    ADD COLUMN locked_until          DATETIME     NULL                      AFTER failed_login_attempts;

-- On vide les refresh tokens existants (tokens en clair, invalides en prod)
-- afin que tous les nouveaux tokens soient des hashes SHA-256
TRUNCATE TABLE refresh_tokens;

-- On remplace le stockage en clair par un hash SHA-256 (CHAR 64)
ALTER TABLE refresh_tokens
    CHANGE COLUMN token token_hash CHAR(64) NOT NULL,
    DROP INDEX  uq_refresh_tokens_token,
    ADD CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash);

CREATE INDEX idx_users_locked_until          ON users(locked_until);
CREATE INDEX idx_refresh_tokens_user_revoked ON refresh_tokens(user_id, revoked);
