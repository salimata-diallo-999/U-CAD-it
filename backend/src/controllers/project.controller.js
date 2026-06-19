const db = require('../config/db');

// US-02 : créer un nouveau projet
async function createProject(req, res, next) {
  try {
    const { name, description, templateId } = req.body;
    const result = await db.query(
      `INSERT INTO projects (school_id, name, description, template_id, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.schoolId, name, description, templateId || null, req.user.id]
    );
    const project = result.rows[0];

    await db.query(
      `INSERT INTO project_members (project_id, user_id, team_role) VALUES ($1, $2, 'leader')`,
      [project.id, req.user.id]
    );

    // Initialise les 6 étapes du processus pour ce projet
    const steps = await db.query('SELECT id FROM process_steps ORDER BY step_number');
    for (const step of steps.rows) {
      await db.query(
        `INSERT INTO project_steps (project_id, process_step_id) VALUES ($1, $2)`,
        [project.id, step.id]
      );
    }

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

// US-09 : liste des projets de l'étudiant avec indicateur de progression
async function listMyProjects(req, res, next) {
  try {
    const result = await db.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM project_steps ps WHERE ps.project_id = p.id AND ps.status = 'validated') AS steps_validated,
        (SELECT COUNT(*) FROM project_steps ps WHERE ps.project_id = p.id) AS steps_total
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1 AND p.is_archived = false
       ORDER BY p.updated_at DESC`,
      [req.user.id]
    );
    res.json({ projects: result.rows });
  } catch (err) {
    next(err);
  }
}

// US-05 : inviter un coéquipier
async function addMember(req, res, next) {
  try {
    const { projectId } = req.params;
    const { userId, teamRole } = req.body;
    const result = await db.query(
      `INSERT INTO project_members (project_id, user_id, team_role)
       VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO NOTHING RETURNING *`,
      [projectId, userId, teamRole || 'member']
    );
    res.status(201).json({ member: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// US-11 : tableau de bord enseignant — tous ses groupes
async function listTeacherProjects(req, res, next) {
  try {
    const result = await db.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM project_steps ps WHERE ps.project_id = p.id AND ps.status = 'submitted') AS pending_review
       FROM projects p
       WHERE p.teacher_id = $1
       ORDER BY p.updated_at DESC`,
      [req.user.id]
    );
    res.json({ projects: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { createProject, listMyProjects, addMember, listTeacherProjects };
