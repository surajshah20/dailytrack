import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Neon PostgreSQL...');
    const migrationFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFilePath, 'utf-8');

    console.log('Executing 001_initial_schema.sql...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('Database migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();