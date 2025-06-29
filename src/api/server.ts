import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

import { env } from '@/config/environment';
import { createDatabase, runMigrations, checkDatabaseHealth } from '@/shared/infrastructure/database';
import { eventBus } from '@/shared/infrastructure/events';
import { createErrorHandler } from '@/shared/infrastructure/errors';
import { createAuthMiddleware } from '@/shared/infrastructure/auth';

// Import modules
import { createJobsModule } from '@/modules/jobs';

export async function createServer() {
  // Initialize database
  const db = createDatabase(env.DATABASE_URL);
  
  // Run migrations
  await runMigrations(db);
  
  // Check database health
  const isHealthy = await checkDatabaseHealth(db);
  if (!isHealthy) {
    throw new Error('Database health check failed');
  }

  // Initialize modules
  const jobsModule = createJobsModule(db, eventBus);

  // Create Elysia app
  const app = new Elysia()
    .use(
      swagger({
        documentation: {
          info: {
            title: 'HR Recruitment System API',
            version: '1.0.0',
            description: 'Modern HR Recruitment System built with modular monolith architecture',
          },
          tags: [
            { name: 'Jobs', description: 'Job management endpoints' },
            { name: 'Candidates', description: 'Candidate management endpoints' },
            { name: 'Applications', description: 'Application management endpoints' },
          ],
        },
      })
    )
    .use(
      cors({
        origin: env.CORS_ORIGIN.split(','),
        credentials: true,
      })
    )
    .onError(createErrorHandler())
    .derive(createAuthMiddleware())
    
    // Health check endpoint
    .get('/health', () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.NODE_ENV,
    }))
    
    // API routes
    .group('/api/v1', (app) =>
      app
        .use(jobsModule.routes)
        // TODO: Add other module routes
    );

  return app;
}

export async function startServer() {
  const app = await createServer();
  
  app.listen(env.PORT);
  
  console.log(`🚀 HR Recruitment System API running at http://localhost:${env.PORT}`);
  console.log(`📚 API Documentation: http://localhost:${env.PORT}/swagger`);
  console.log(`🏥 Health Check: http://localhost:${env.PORT}/health`);
  
  return app;
}