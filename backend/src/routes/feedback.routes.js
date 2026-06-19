const express = require('express');
const router = express.Router();
const {
  addComment, listComments, listNotifications, markNotificationRead,
} = require('../controllers/feedback.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/deliverables/:deliverableId/comments', addComment);
router.get('/deliverables/:deliverableId/comments', listComments);
router.get('/notifications', listNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

module.exports = router;
