const express = require('express');
const router = express.Router();
const {
  createProject, listMyProjects, addMember, listTeacherProjects,
} = require('../controllers/project.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', authorize('student'), createProject);
router.get('/mine', authorize('student'), listMyProjects);
router.post('/:projectId/members', authorize('student'), addMember);
router.get('/teacher', authorize('teacher'), listTeacherProjects);

module.exports = router;
