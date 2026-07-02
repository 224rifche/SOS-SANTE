-- ============================================================================
-- WON-MALLY - Ajout du lien Ambulancier -> Ambulance assignee
-- Permet de retrouver precisement l'ambulance sur laquelle un ambulancier
-- est affecte, plutot que de deviner par centre medical.
-- ============================================================================
ALTER TABLE ambulanciers
    ADD COLUMN current_ambulance_id VARCHAR(36) NULL,
    ADD CONSTRAINT fk_ambulanciers_ambulance
        FOREIGN KEY (current_ambulance_id) REFERENCES ambulances(id)
        ON DELETE SET NULL;

CREATE INDEX idx_ambulanciers_current_ambulance ON ambulanciers(current_ambulance_id);