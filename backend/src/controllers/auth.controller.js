const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// US-01 : inscription avec code école
async function register(req, res, next) {
  try {
    const { fullName, email, password, role, schoolCode, programId } = req.body;

    const school = await db.query('SELECT id FROM schools WHERE registration_code = $1', [schoolCode]);
    if (school.rows.length === 0) {
      return res.status(400).json({ error: 'Code école invalide.' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (school_id, program_id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, role`,
      [school.rows[0].id, programId || null, fullName, email, passwordHash, role || 'student']
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// US: connexion email/mot de passe avec session persistante (JWT)
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, schoolId: user.school_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await db.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

    res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, role, school_id, program_id, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
