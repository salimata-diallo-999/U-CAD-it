const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * PLACEHOLDER — Module IA d'aide à la conception
 * Voir /ai-module/docs/ARCHITECTURE.md pour la spécification complète.
 * Ces routes ne sont pas encore implémentées ; elles documentent
 * le contrat d'API prévu pour ne pas bloquer le développement frontend.
 */

router.use(authenticate);

// Prévu : suggestions contextuelles pendant la rédaction du CdCF, de la fiche besoin, etc.
router.post('/suggest', (req, res) => {
  res.status(501).json({
    error: 'Module IA non implémenté.',
    info: 'Voir ai-module/docs/ARCHITECTURE.md',
  });
});

// Prévu : assistant conversationnel contextualisé au projet courant
router.post('/chat', (req, res) => {
  res.status(501).json({
    error: 'Module IA non implémenté.',
    info: 'Voir ai-module/docs/ARCHITECTURE.md',
  });
});

module.exports = router;
