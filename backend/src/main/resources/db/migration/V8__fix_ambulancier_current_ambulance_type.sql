-- ============================================================================
-- WON-MALLY - Correction du type de colonne current_ambulance_id
-- VARCHAR(36) -> CHAR(36), coherent avec le type UUID standard du schema
-- Necessite de retirer temporairement la contrainte FK (MySQL ne permet pas
-- de modifier le type d'une colonne engagee dans une FK active).
-- ============================================================================
ALTER TABLE ambulanciers
    DROP FOREIGN KEY fk_ambulanciers_ambulance;

ALTER TABLE ambulanciers
    MODIFY COLUMN current_ambulance_id CHAR(36) NULL;

ALTER TABLE ambulanciers
    ADD CONSTRAINT fk_ambulanciers_ambulance
        FOREIGN KEY (current_ambulance_id) REFERENCES ambulances(id)
        ON DELETE SET NULL;