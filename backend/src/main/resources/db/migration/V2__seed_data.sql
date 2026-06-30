-- ============================================================================
-- WON-MALLY - DONNEES D'AMORCAGE (SEED)
-- ============================================================================

INSERT INTO roles (name, description) VALUES
('ADMIN', 'Administrateur systeme'),
('CITIZEN', 'Citoyen demandeur de secours'),
('MEDICAL_CENTER', 'Regulateur de centre medical'),
('AMBULANCIER', 'Ambulancier sur le terrain'),
('DOCTOR', 'Medecin urgentiste');

INSERT INTO permissions (code, label, description) VALUES
('ALERT_CREATE', 'Creer une alerte', 'Permet de declencher une alerte SOS'),
('ALERT_VALIDATE', 'Valider une alerte', 'Permet a un regulateur de valider/rejeter une alerte'),
('INTERVENTION_MANAGE', 'Gerer une intervention', 'Permet de mettre a jour le statut d''une intervention'),
('AMBULANCE_ASSIGN', 'Affecter une ambulance', 'Permet d''affecter une ambulance a une intervention'),
('MEDICAL_NOTE_WRITE', 'Rediger une note medicale', 'Permet a un medecin de saisir une note medicale'),
('USER_MANAGE', 'Gerer les utilisateurs', 'Permet a l''administrateur de gerer les comptes'),
('AUDIT_VIEW', 'Consulter les audits', 'Permet de consulter les journaux d''audit'),
('STATISTICS_VIEW', 'Consulter les statistiques', 'Permet de consulter les tableaux de bord statistiques');

-- Association role -> permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'CITIZEN' AND p.code = 'ALERT_CREATE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'MEDICAL_CENTER' AND p.code IN ('ALERT_VALIDATE','INTERVENTION_MANAGE','AMBULANCE_ASSIGN','STATISTICS_VIEW');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'AMBULANCIER' AND p.code = 'INTERVENTION_MANAGE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'DOCTOR' AND p.code IN ('INTERVENTION_MANAGE','MEDICAL_NOTE_WRITE');

INSERT INTO emergency_categories (name, priority, description) VALUES
('Accident de la route', 1, 'Accident de circulation avec blesse(s)'),
('Malaise / Perte de connaissance', 1, 'Malaise cardiaque, respiratoire ou perte de connaissance'),
('Accouchement', 1, 'Urgence obstetricale'),
('Blessure grave / Hemorragie', 1, 'Plaie profonde, hemorragie importante'),
('Brulure', 2, 'Brulure thermique ou chimique'),
('Intoxication', 2, 'Intoxication alimentaire, medicamenteuse ou chimique'),
('Crise convulsive', 1, 'Crise d''epilepsie ou convulsions'),
('Autre urgence', 3, 'Urgence medicale non categorisee');
