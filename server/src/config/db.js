import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech'))
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Idle clients get dropped by Neon routinely. Log it; the pool replaces them. Never exit.
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err.message);
});

export const query = (text, params) => pool.query(text, params);
export default pool;