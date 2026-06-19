# ai-module — Module IA d'aide à la conception

**Statut : placeholder.** Ce dossier ne contient pas encore de code fonctionnel.

Voir [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) pour :
- les cas d'usage envisagés à chaque étape du processus de conception,
- le contrat d'API prévu (`/api/ai/suggest`, `/api/ai/chat`),
- les décisions à trancher avant l'implémentation.

Le backend expose déjà les routes correspondantes (`backend/src/routes/ai.routes.js`) qui répondent `501 Not Implemented` en attendant le développement réel de ce module.

## Structure prévue (à créer)

```
ai-module/
├── docs/
│   └── ARCHITECTURE.md
├── src/
│   ├── ai.service.js       # appel au fournisseur LLM
│   ├── prompts/            # templates de prompts par étape (1-6)
│   └── context-builder.js  # construit le contexte projet à injecter
└── README.md
```
