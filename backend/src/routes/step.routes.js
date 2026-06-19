const express = require('express');
const router = express.Router();
const {
  listProjectSteps, saveDeliverable, submitStep, reviewStep,
} = require('../controllers/step.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/project/:projectId', listProjectSteps);
router.post('/:projectStepId/deliverables', authorize('student'), saveDeliverable);
router.post('/:projectStepId/submit', authorize('student'), submitStep);
router.post('/:projectStepId/review', authorize('teacher'), reviewStep);

module.exports = router;
