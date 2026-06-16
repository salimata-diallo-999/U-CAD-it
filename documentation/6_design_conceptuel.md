# 6. Design Conceptuel (Phase 2) - U-CAD-it

## 📋 Introduction

Le **Design Conceptuel** transforme la compréhension du problème en solutions concrètes et testables.

Cette phase couvre :
1. **Personas Utilisateurs** - Profils réalistes des utilisateurs
2. **User Stories** - Besoins fonctionnels structurés
3. **Architecture Fonctionnelle** - Organisation modulaire
4. **Wireframes** - Maquettes basse fidélité

---

## 1️⃣ Personas Utilisateurs

### Persona 1 : Mamadou Diallo (L'Étudiant)
- **Âge** : 23 ans, L3 Génie Informatique, ESP-UCAD, Dakar
- **Frustrations** : Ne sait pas comment commencer, utilise Word/Excel inadaptés, feedback lent, connexion instable
- **Objectifs** : Étapes guidées, espace centralisé, feedback structuré, collaboration
- **Citation** : "Je sais que je dois faire une analyse fonctionnelle, mais personne ne m'a montré comment la relier à mon cahier des charges. J'avance à l'aveugle."

### Persona 2 : Dr. Fatou Sarr (L'Enseignant)
- **Âge** : 45 ans, Maître de Conférences en Génie Mécanique, ENSEPT, Thiès
- **Frustrations** : Suivi en temps réel impossible, livrables incomplets, gestion fichiers éparpillée, pas d'historique
- **Objectifs** : Tableau de bord, commentaires précis, validation par étape, paramétrage curriculum
- **Citation** : "J'ai 10 groupes à suivre. Je reçois 40 fichiers Word différents, sans structure commune. Je n'arrive même plus à savoir qui en est où."

### Persona 3 : Amadou Ba (L'Admin)
- **Rôle** : Responsable IT/Pédagogique d'école
- **Objectifs** : Gestion facile utilisateurs, paramétrage curriculum, statistiques, support multi-écoles

---

## 2️⃣ User Stories (20 au total)

### Étudiant (10 stories)
- US-01 : M'inscrire et créer un profil
- US-02 : Créer un nouveau projet
- US-03 : Suivre étapes guidées (6 étapes)
- US-04 : Rédiger CDC dans éditeur structuré
- US-05 : Inviter coéquipiers
- US-06 : Recevoir commentaires de l'enseignant
- US-07 : Exporter dossier en PDF
- US-08 : Utiliser plateforme sans internet
- US-09 : Voir indicateur de progression
- US-10 : Accéder à tutoriels intégrés

### Enseignant (7 stories)
- US-11 : Voir tableau de bord tous groupes
- US-12 : Accéder détail chaque projet
- US-13 : Laisser commentaires annotés
- US-14 : Valider/rejeter chaque étape
- US-15 : Paramétrer étapes du processus
- US-16 : Recevoir notifications de soumissions
- US-17 : Exporter rapports d'avancement

### Admin (3 stories)
- US-18 : Créer/gérer comptes utilisateurs
- US-19 : Définir templates curriculum par filière
- US-20 : Consulter statistiques d'utilisation

---

## 3️⃣ Architecture Fonctionnelle (6 modules)

```
U-CAD-it ARCHITECTURE
├─ M1: Authentification & Rôles
├─ M2: Gestion des Projets
├─ M3: Processus Guidé (CŒUR) ⭐
├─ M4: Suivi Pédagogique
├─ M5: Collaboration & Communication
└─ M6: Export & Interopérabilité
```

### M1 : Authentification & Gestion des Rôles
- Inscription/Connexion
- Gestion de profil
- Contrôle d'accès (RBAC)
- Mode hors ligne

### M2 : Gestion des Projets
- Création de projet
- Gestion d'équipe
- Calendrier & jalons
- Tableau de bord projet
- Archivage

### M3 : Processus Guidé (CŒUR)
**Les 6 étapes** :
1. Analyse du besoin → Fiche d'analyse
2. Cahier des charges → CdCF
3. Idéation → Rapport d'idéation
4. Modélisation → Diagrammes
5. Prototypage → Dossier prototype
6. Évaluation → Rapport validation

### M4 : Suivi Pédagogique
- Tableau de bord enseignant
- Commentaires annotés
- Validation par étape
- Notifications
- Historique & traçabilité

### M5 : Collaboration & Communication
- Travail collaboratif temps réel
- Messagerie de projet
- Partage de fichiers
- Mentions & tâches

### M6 : Export & Interopérabilité
- Export PDF
- Export Word
- Import templates
- API REST

---

## 4️⃣ Wireframes (7 écrans clés)

### W1 : Connexion
Formulaire email/mot de passe, liens inscription et rôle

### W2 : Dashboard Étudiant
- Mes projets (cartes avec progression)
- Bouton "+ Nouveau Projet"
- Notifications récentes

### W3 : Vue Projet - Progression
Barre des 6 étapes avec statuts colorés (Gris / Bleu / Orange / Vert / Rouge)

### W4 : Éditeur CDC
Deux colonnes :
- Gauche : Formulaire structuré avec sections pré-définies
- Droite : Aide contextuelle, exemples, ressources

### W5 : Dashboard Enseignant
Tableau : Groupe | Projet | Étape | Statut | Activité | Actions
Avec filtres rapides et encart "Soumissions récentes"

### W6 : Correction Enseignant
Livrable à gauche, zone de commentaires à droite, boutons Valider/Rejeter

### W7 : Admin Panel
Gestion utilisateurs, curricula, statistiques

---

## 📚 Stack Technique Recommandée

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend** | React.js + PWA | Responsive, offline natif |
| **Backend** | Node.js + Express | Léger, rapide, communauté |
| **BD** | PostgreSQL | Robuste, open source, relationnel |
| **Auth** | JWT + RBAC | Sécurisé, gestion fine rôles |
| **Hébergement** | VPS Linux (OVH/DigitalOcean) | Coût maîtrisé, déploiement SN |
| **Export** | Puppeteer (PDF) | Génération PDF côté serveur |

---

## 🚀 Roadmap de Développement

| Phase | Activité | Durée |
|-------|----------|--------|
| **Phase 3** | Maquette haute fidélité (Figma) | 2–3 sem |
| **Phase 3** | Tests utilisateurs (5-8 étudiants + 2 encadreurs) | 1 sem |
| **Phase 4** | MVP : M1 + M2 + M3 | 6–8 sem |
| **Phase 4** | Tests techniques | 2 sem |
| **Phase 5** | Pilote : déploiement réel | 1 sem |
| **Phase 6** | Itération continue | Continu |

---

## ✅ Checklist Design Conceptuel

- [ ] Personas validés
- [ ] User Stories priorisées
- [ ] Architecture fonctionnelle revue
- [ ] Wireframes dessinés sur papier
- [ ] Wireframes numérisés (Figma/Balsamiq)
- [ ] Tests utilisateurs planifiés
