import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const migrationsDir = path.resolve(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'));

    for (const file of files) {
      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      await client.query(sql);
    }

    await client.query('COMMIT');
    console.log('✅ Migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
