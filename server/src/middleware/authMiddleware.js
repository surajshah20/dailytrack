import { verifyToken } from '../utils/jwt.js';
import pool from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.dailytrack_token;

    // Support Bearer authorization header as a fallback
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const decoded = verifyToken(token);

    // Verify user exists in the database
    const userResult = await pool.query(
      'SELECT id, email, display_name, timezone, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }
};