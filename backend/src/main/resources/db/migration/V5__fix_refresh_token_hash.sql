-- ============================================================================
-- V5 - Correction du type de token_hash (CHAR -> VARCHAR) pour Hibernate
-- ============================================================================
ALTER TABLE refresh_tokens
    MODIFY COLUMN token_hash VARCHAR(64) NOT NULL;
