# Module IA — Aide à la conception (PLACEHOLDER)

> Statut : **non implémenté**. Ce document fixe l'architecture cible afin de préparer son intégration sans bloquer le développement du MVP (M1-M6).

## Objectif

Intégrer un assistant IA contextuel qui aide l'étudiant à chaque étape du processus de conception (M3), en s'appuyant sur le contenu réel de son projet (besoin, CdCF, idéation, etc.) plutôt que des réponses génériques.

## Cas d'usage envisagés

| Étape | Aide apportée par l'IA |
|---|---|
| 1. Analyse du besoin | Reformuler/structurer la fiche de besoin, poser des questions de clarification |
| 2. Cahier des charges | Suggérer des fonctions de service manquantes, vérifier la cohérence des contraintes |
| 3. Idéation | Proposer des pistes de solutions, aider à comparer des alternatives |
| 4. Modélisation | Vérifier la cohérence d'un diagramme SADT/IDEF0 décrit en texte |
| 5. Prototypage | Suggérer des critères de test pour le prototype |
| 6. Évaluation | Aider à formuler la grille d'évaluation et l'analyse des écarts |

## Position dans l'architecture globale

```
frontend (React)
   │  POST /api/ai/suggest, /api/ai/chat
   ▼
backend (Express) ── routes/ai.routes.js  (placeholder actuel, 501 Not Implemented)
   │
   ▼
ai-service (futur micro-service ou module backend dédié)
   │  appel à un LLM (ex. API Claude) avec contexte injecté :
   │  - contenu du livrable en cours (deliverables.content)
   │  - étape du processus (process_steps)
   │  - historique des feedbacks enseignant (comments)
   ▼
Fournisseur LLM externe
```

## Contrat d'API prévu

### `POST /api/ai/suggest`
Suggestion contextuelle pendant la rédaction d'un livrable.

**Requête**
```json
{
  "projectStepId": "uuid",
  "fieldContext": "fonctions_de_service",
  "currentText": "..."
}
```

**Réponse attendue**
```json
{
  "suggestion": "...",
  "confidence": "low|medium|high"
}
```

### `POST /api/ai/chat`
Assistant conversationnel contextualisé au projet courant.

**Requête**
```json
{
  "projectId": "uuid",
  "message": "Comment formuler la fonction principale de mon produit ?"
}
```

## Décisions à prendre avant implémentation

1. **Fournisseur LLM** : API externe (coût récurrent, qualité supérieure) vs modèle auto-hébergé (coût d'infra, contrôle des données — pertinent compte tenu du contexte d'infrastructure limitée évoqué en Phase 1).
2. **Confidentialité des données étudiantes** : anonymisation avant envoi au fournisseur, ou hébergement local.
3. **Mode hors ligne (US-08)** : l'IA nécessitant une connexion, prévoir une dégradation explicite ("Suggestions IA indisponibles hors ligne") plutôt qu'une erreur silencieuse.
4. **Garde-fou pédagogique** : l'IA doit guider, pas faire le travail à la place de l'étudiant — risque identifié à traiter avec l'encadrement pédagogique (Dr. Sarr, persona enseignant) avant la mise en production.

## Implémentation (à faire)

- [ ] Choisir le fournisseur LLM et créer `ai-module/src/ai.service.js`
- [ ] Définir le système de prompt avec contexte projet
- [ ] Retirer les `501` dans `backend/src/routes/ai.routes.js` et brancher le vrai service
- [ ] Ajouter `AI_PROVIDER_API_KEY` dans `.env`
- [ ] Tests de la qualité des réponses avec de vrais livrables d'étudiants
