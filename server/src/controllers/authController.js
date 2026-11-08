const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const { parseRegister, parseLogin } = require('../validation/auth');
const { signToken } = require('../utils/token');
const { httpError } = require('../utils/httpError');

// 10 is bcrypt's usual work factor. The hash is what we store, never the password.
const BCRYPT_ROUNDS = 10;

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = parseRegister(req.body);
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    const user = publicUser(result.rows[0]);
    res.status(201).json({ user, token: signToken(user.id) });
  } catch (err) {
    // Unique email. Checked here so two sign-ups at once still get 409.
    if (err.code === '23505') {
      next(httpError(409, 'An account with this email already exists.'));
      return;
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = parseLogin(req.body);

    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );

    const row = result.rows[0];
    const passwordMatches = row ? await bcrypt.compare(password, row.password_hash) : false;

    if (!row || !passwordMatches) {
      next(httpError(401, 'Invalid email or password.'));
      return;
    }

    const user = publicUser(row);
    res.json({ user, token: signToken(user.id) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const row = result.rows[0];
    if (!row) {
      next(httpError(401, 'Invalid or missing token.'));
      return;
    }

    res.json({ user: publicUser(row) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
