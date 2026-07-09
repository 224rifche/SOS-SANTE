-- ============================================================================
-- V10 - TOKENS DE VERIFICATION D'EMAIL
-- ============================================================================
CREATE TABLE email_verification_tokens (
    id              CHAR(36) NOT NULL PRIMARY KEY,
    user_id         CHAR(36) NOT NULL,
    token_hash      CHAR(64) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_email_verification_tokens_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_email_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_email_verification_tokens_user_used ON email_verification_tokens(user_id, used);