#!/usr/bin/env bun

import { createDatabase, runMigrations } from '../src/shared/infrastructure/database';
import { env } from '../src/config/environment';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    const db = createDatabase(env.DATABASE_URL);
    await runMigrations(db);
    
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();