import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { signToken, setTokenCookie, clearTokenCookie } from '../utils/jwt.js';

// Starter categories created for every new user
const DEFAULT_CATEGORIES = [
  { name: 'Development', color: '#6366F1', icon: 'code' },
  { name: 'Study', color: '#3B82F6', icon: 'book-open' },
  { name: 'Personal', color: '#10B981', icon: 'user' },
  { name: 'Fitness', color: '#F59E0B', icon: 'activity' }
];

export const register = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, displayName, timezone = 'UTC' } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and display name.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already taken
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Hash password with 12 rounds
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await client.query('BEGIN');

    // 1. Create User
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, display_name, timezone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, display_name, timezone, created_at`,
      [normalizedEmail, passwordHash, displayName.trim(), timezone]
    );
    const newUser = userResult.rows[0];

    // 2. Initialize default user settings
    await client.query(
      `INSERT INTO user_settings (user_id, daily_target_minutes, week_starts_on, theme)
       VALUES ($1, 480, 1, 'dark')`,
      [newUser.id]
    );

    // 3. Seed starter categories
    for (const cat of DEFAULT_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (user_id, name, color_hex, icon)
         VALUES ($1, $2, $3, $4)`,
        [newUser.id, cat.name, cat.color, cat.icon]
      );
    }

    await client.query('COMMIT');

    // Generate token and set HTTP-only cookie
    const token = signToken({ id: newUser.id, email: newUser.email });
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token // Provided for mobile/API clients
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register account'
    });
  } finally {
    client.release();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch user and hashed password
    const result = await pool.query(
      `SELECT id, email, password_hash, display_name, timezone, created_at
       FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Exclude password_hash from response
    delete user.password_hash;

    const token = signToken({ id: user.id, email: user.email });
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

export const logout = (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const getMe = async (req, res) => {
  try {
    // req.user is populated by authenticate middleware
    const settingsResult = await pool.query(
      'SELECT daily_target_minutes, week_starts_on, theme FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
        settings: settingsResult.rows[0] || null
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};