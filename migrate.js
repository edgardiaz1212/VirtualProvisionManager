import { migrate } from './migrations/001_init.js';

async function runMigration() {
  try {
    console.log('Starting database migration...');
    await migrate();
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
