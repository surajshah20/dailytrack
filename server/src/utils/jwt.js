import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dailytrack_development_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const setTokenCookie = (res, token) => {
  res.cookie('dailytrack_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearTokenCookie = (res) => {
  res.clearCookie('dailytrack_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};