# U-CAD-it — Frontend

Application React (Vite) + PWA pour le mode hors ligne (US-08).

## Installation

```bash
npm install
npm run dev
```

L'application proxy les requêtes `/api` vers `http://localhost:4000` (voir `vite.config.js`).

## Structure

```
src/
├── pages/        # écrans (Login, StudentDashboard, TeacherDashboard, ProjectView...)
├── components/   # composants réutilisables
├── context/      # AuthContext (JWT en localStorage)
├── services/     # client API axios
└── hooks/, utils/, assets/
```

## Écrans prioritaires (voir wireframes Phase 2)

- W1 — Page de connexion → `pages/Login.jsx`
- W2 — Dashboard étudiant → `pages/StudentDashboard.jsx`
- W3 — Vue projet (6 étapes) → `pages/ProjectView.jsx`
- W4 — Éditeur de cahier des charges → à créer
- W5 — Dashboard enseignant → `pages/TeacherDashboard.jsx`
- W6 — Vue correction enseignant → à créer
- W7 — Page d'administration → à créer

## Build production

```bash
npm run build
```
