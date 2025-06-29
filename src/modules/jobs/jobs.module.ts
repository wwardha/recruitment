import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { createJobsRoutes } from './jobs.routes';
import { EventBus } from '@/shared/infrastructure/events';
import { jobs } from './jobs.schema';

export function createJobsModule(db: PostgresJsDatabase<{ jobs: typeof jobs }>, eventBus: EventBus) {
  const repository = new JobsRepository(db);
  const service = new JobsService(repository, eventBus);
  const routes = createJobsRoutes(service);

  return {
    service,
    routes,
    // Public API for other modules
    api: {
      getJob: (id: string) => service.getJob(id),
      isJobOpen: (id: string) => service.isJobOpen(id),
      getPublishedJobs: () => service.getPublishedJobs(),
    },
  };
}

export type JobsModule = ReturnType<typeof createJobsModule>;
