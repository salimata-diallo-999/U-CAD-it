-- =========================================================
-- Seed : référentiel des 6 étapes du processus de conception
-- =========================================================

INSERT INTO process_steps (step_number, code, name, description, expected_deliverable) VALUES
(1, 'need_analysis', 'Analyse du besoin',
 'Formulaire guidé : qui, quoi, pourquoi. Contexte d''usage, contraintes initiales.',
 'Fiche d''analyse du besoin'),
(2, 'cdc', 'Cahier des charges',
 'Éditeur structuré : fonctions de service, contraintes, normes. Diagramme FAST.',
 'Cahier des charges fonctionnel (CdCF)'),
(3, 'ideation', 'Idéation',
 'Espace de brainstorming, matrice de comparaison des solutions, vote d''équipe.',
 'Rapport d''idéation + solution retenue'),
(4, 'modeling', 'Modélisation',
 'Éditeur de diagrammes (SADT/IDEF0), import de fichiers CAO.',
 'Modèles fonctionnels et structurels'),
(5, 'prototype', 'Prototypage',
 'Fiches de prototype, photos/vidéos du prototype physique ou numérique.',
 'Dossier prototype'),
(6, 'evaluation', 'Évaluation & Validation',
 'Grille d''évaluation par critères, comparaison solution / besoin initial.',
 'Rapport de validation final')
ON CONFLICT (step_number) DO NOTHING;

-- Écoles de démonstration
INSERT INTO schools (name, code, city, registration_code) VALUES
('École Supérieure Polytechnique - UCAD', 'ESP-UCAD', 'Dakar', 'ESP2025'),
('École Nationale Supérieure d''Enseignement Technique et Professionnel', 'ENSEPT', 'Thiès', 'ENSEPT2025')
ON CONFLICT (code) DO NOTHING;
