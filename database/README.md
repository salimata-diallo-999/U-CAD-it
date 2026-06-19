# Base de données — U-CAD-it

PostgreSQL. Le schéma conceptuel complet est documenté dans [`schema.md`](./schema.md).
Ce dossier contient maintenant la **base de données réelle** (migrations SQL exécutables).

## Structure

```
database/
├── schema.md              # Documentation conceptuelle du schéma (existant)
├── migrations/
│   └── 001_init_schema.sql # Création de toutes les tables, types, contraintes, triggers
├── seeds/
│   └── 001_process_steps.sql # Données de référence (6 étapes du processus, écoles démo)
└── README.md
```

## Installation locale

### 1. Lancer PostgreSQL avec Docker (recommandé)

Depuis la racine du projet :
```bash
docker compose up -d postgres
```

### 2. Ou en local sans Docker

```bash
createdb ucadit
psql -d ucadit -f database/migrations/001_init_schema.sql
psql -d ucadit -f database/seeds/001_process_steps.sql
```

### 3. Variables d'environnement (backend/.env)

```
DATABASE_URL=postgresql://ucadit_user:ucadit_pass@localhost:5432/ucadit
```

## Modules couverts par le schéma

| Module | Tables principales |
|---|---|
| M1 — Authentification & Rôles | `users`, `schools`, `programs` |
| M2 — Gestion des Projets | `projects`, `project_members`, `milestones` |
| M3 — Processus Guidé (cœur) | `process_steps`, `project_steps`, `deliverables`, `curriculum_templates` |
| M4 — Suivi Pédagogique | `comments`, `notifications`, `activity_logs` |
| M5 — Collaboration | `messages`, `tasks`, `files` |
| M6 — Export | `exports` |

## Prochaines migrations

Ajouter les fichiers numérotés séquentiellement : `002_xxx.sql`, `003_xxx.sql`, etc.
Ne jamais modifier une migration déjà appliquée en production — créer une nouvelle migration corrective.
