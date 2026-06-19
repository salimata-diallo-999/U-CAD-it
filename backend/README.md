# U-CAD-it — Backend API

API REST en Node.js/Express, authentification JWT, base de données PostgreSQL.

## Installation

```bash
npm install
cp .env.example .env   # puis ajuster DATABASE_URL et JWT_SECRET
npm run migrate
npm run seed
npm run dev
```

## Structure

```
src/
├── config/db.js          # pool PostgreSQL
├── middlewares/           # auth (JWT/RBAC), gestion d'erreurs
├── controllers/           # logique métier par module
├── routes/                 # définition des endpoints
├── utils/                  # scripts migrate/seed
├── app.js
└── server.js
```

## Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription (code école requis) |
| POST | `/api/auth/login` | Connexion (retourne un JWT) |
| GET | `/api/auth/me` | Profil de l'utilisateur connecté |
| POST | `/api/projects` | Créer un projet (étudiant) |
| GET | `/api/projects/mine` | Mes projets (étudiant) |
| GET | `/api/projects/teacher` | Tableau de bord enseignant |
| GET | `/api/steps/project/:projectId` | Les 6 étapes d'un projet et leur statut |
| POST | `/api/steps/:projectStepId/deliverables` | Enregistrer un livrable |
| POST | `/api/steps/:projectStepId/submit` | Soumettre une étape |
| POST | `/api/steps/:projectStepId/review` | Valider/rejeter une étape (enseignant) |
| POST/GET | `/api/deliverables/:id/comments` | Commentaires annotés |
| GET | `/api/notifications` | Notifications de l'utilisateur |
| POST | `/api/ai/*` | **Placeholder** module IA (501 pour l'instant) |

## Tests

```bash
npm test
```
