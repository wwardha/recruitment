import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Import all schemas
import { jobs } from '@/modules/jobs/jobs.schema';
// import { candidates } from '@/modules/candidates/candidates.schema';
// import { applications } from '@/modules/applications/applications.schema';

// Database schema type
export const schema = {
  jobs,
  // candidates,
  // applications,
};

export type DatabaseSchema = typeof schema;

// Create database connection
export function createDatabase(connectionString: string) {
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });
  
  return db;
}

// Run migrations
export async function runMigrations(db: ReturnType<typeof createDatabase>) {
  await migrate(db, { migrationsFolder: './drizzle/migrations' });
  console.log('✅ Database migrations completed');
}

// Health check
export async function checkDatabaseHealth(db: ReturnType<typeof createDatabase>) {
  try {
    // Simple query to check if database is accessible
    await db.select().from(jobs).limit(1);
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}
