const db = require('../config/db');

// US-03 : voir les 6 étapes guidées d'un projet avec leur statut
async function listProjectSteps(req, res, next) {
  try {
    const { projectId } = req.params;
    const result = await db.query(
      `SELECT ps.*, st.step_number, st.code, st.name, st.expected_deliverable
       FROM project_steps ps
       JOIN process_steps st ON st.id = ps.process_step_id
       WHERE ps.project_id = $1
       ORDER BY st.step_number`,
      [projectId]
    );
    res.json({ steps: result.rows });
  } catch (err) {
    next(err);
  }
}

// US-04 : enregistrer un livrable (ex. cahier des charges) - brouillon
async function saveDeliverable(req, res, next) {
  try {
    const { projectStepId } = req.params;
    const { content, fileUrl } = req.body;

    const lastVersion = await db.query(
      'SELECT COALESCE(MAX(version), 0) AS v FROM deliverables WHERE project_step_id = $1',
      [projectStepId]
    );

    const result = await db.query(
      `INSERT INTO deliverables (project_step_id, version, content, file_url, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [projectStepId, lastVersion.rows[0].v + 1, content, fileUrl || null, req.user.id]
    );

    await db.query(
      `UPDATE project_steps SET status = 'in_progress' WHERE id = $1 AND status = 'not_started'`,
      [projectStepId]
    );

    res.status(201).json({ deliverable: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// US-04/US-06 : soumettre le livrable à l'enseignant
async function submitStep(req, res, next) {
  try {
    const { projectStepId } = req.params;
    const result = await db.query(
      `UPDATE project_steps SET status = 'submitted', submitted_at = now() WHERE id = $1 RETURNING *`,
      [projectStepId]
    );
    res.json({ step: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// US-14 : validation/rejet par l'enseignant
async function reviewStep(req, res, next) {
  try {
    const { projectStepId } = req.params;
    const { decision, reason } = req.body; // decision: 'validated' | 'rejected'

    if (decision === 'rejected' && !reason) {
      return res.status(400).json({ error: 'Un motif est obligatoire en cas de rejet.' });
    }

    const result = await db.query(
      `UPDATE project_steps
       SET status = $1, validated_at = now(), validated_by = $2,
           rejection_reason = $3
       WHERE id = $4 RETURNING *`,
      [decision, req.user.id, decision === 'rejected' ? reason : null, projectStepId]
    );

    res.json({ step: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProjectSteps, saveDeliverable, submitStep, reviewStep };
