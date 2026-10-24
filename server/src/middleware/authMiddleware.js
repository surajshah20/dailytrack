import { verifyToken } from '../utils/jwt.js';
import pool from '../config/db.js';

export const authenticate = async (req, res, next) => {
  // Try every token we were given; a stale cookie must not block a valid Bearer token.
  const candidates = [];
  if (req.headers.authorization?.startsWith('Bearer ')) {
    candidates.push(req.headers.authorization.split(' ')[1]);
  }
  if (req.cookies?.dailytrack_token) {
    candidates.push(req.cookies.dailytrack_token);
  }

  if (candidates.length === 0) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  let decoded = null;
  for (const token of candidates) {
    try {
      decoded = verifyToken(token);
      break;
    } catch {
      // try the next candidate
    }
  }

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, email, display_name, timezone, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('authenticate DB error:', error);
    return res.status(500).json({ success: false, message: 'Server error while checking your session.' });
  }
};