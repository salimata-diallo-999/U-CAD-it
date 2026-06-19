const db = require('../config/db');

// US-13 : commentaires annotés sur un livrable
async function addComment(req, res, next) {
  try {
    const { deliverableId } = req.params;
    const { content, anchor } = req.body;
    const result = await db.query(
      `INSERT INTO comments (deliverable_id, author_id, content, anchor)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [deliverableId, req.user.id, content, anchor || null]
    );
    res.status(201).json({ comment: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function listComments(req, res, next) {
  try {
    const { deliverableId } = req.params;
    const result = await db.query(
      `SELECT c.*, u.full_name AS author_name FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.deliverable_id = $1 ORDER BY c.created_at ASC`,
      [deliverableId]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    next(err);
  }
}

// US-16 : notifications
async function listNotifications(req, res, next) {
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    next(err);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    await db.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { addComment, listComments, listNotifications, markNotificationRead };
