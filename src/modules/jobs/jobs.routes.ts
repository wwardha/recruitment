import { Elysia, t } from 'elysia';
import { JobsService } from './jobs.service';
import { CreateJobSchema, UpdateJobSchema, PublishJobSchema, JobStatus } from './jobs.types';

export const createJobsRoutes = (jobsService: JobsService) =>
  new Elysia({ prefix: '/jobs' })
    .post(
      '/',
      async ({ body, set }) => {
        // TODO: Get user ID from auth context
        const userId = 'temp-user-id';
        const job = await jobsService.createJob(body, userId);
        set.status = 201;
        return { success: true, data: job };
      },
      {
        body: t.Object({
          title: t.String({ minLength: 5 }),
          description: t.String({ minLength: 50 }),
          department: t.String({ minLength: 1 }),
          location: t.Optional(t.String()),
          salaryMin: t.Optional(t.Number({ minimum: 0 })),
          salaryMax: t.Optional(t.Number({ minimum: 0 })),
          requirements: t.Optional(t.Array(t.String())),
        }),
        detail: {
          summary: 'Create a new job posting',
          tags: ['Jobs'],
        },
      }
    )
    .get(
      '/:id',
      async ({ params: { id } }) => {
        const job = await jobsService.getJob(id);
        return { success: true, data: job };
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          summary: 'Get job by ID',
          tags: ['Jobs'],
        },
      }
    )
    .get(
      '/',
      async ({ query }) => {
        // Convert string status to JobStatus enum if provided
        const filters = {
          ...query,
          status: query.status && Object.values(JobStatus).includes(query.status as JobStatus) 
            ? query.status as JobStatus 
            : undefined
        };
        const jobs = await jobsService.listJobs(filters);
        return { success: true, data: jobs };
      },
      {
        query: t.Optional(t.Object({
          status: t.Optional(t.String()),
          department: t.Optional(t.String()),
          createdBy: t.Optional(t.String()),
        })),
        detail: {
          summary: 'List jobs with optional filters',
          tags: ['Jobs'],
        },
      }
    )
    .put(
      '/:id',
      async ({ params: { id }, body }) => {
        const updated = await jobsService.updateJob(id, body);
        return { success: true, data: updated };
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: t.Partial(t.Object({
          title: t.String({ minLength: 5 }),
          description: t.String({ minLength: 50 }),
          department: t.String({ minLength: 1 }),
          location: t.String(),
          salaryMin: t.Number({ minimum: 0 }),
          salaryMax: t.Number({ minimum: 0 }),
          requirements: t.Array(t.String()),
        })),
        detail: {
          summary: 'Update job by ID',
          tags: ['Jobs'],
        },
      }
    )
    .post(
      '/:id/publish',
      async ({ params: { id } }) => {
        const published = await jobsService.publishJob(id);
        return { success: true, data: published };
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          summary: 'Publish a job',
          tags: ['Jobs'],
        },
      }
    )
    .post(
      '/:id/close',
      async ({ params: { id } }) => {
        const closed = await jobsService.closeJob(id);
        return { success: true, data: closed };
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          summary: 'Close a job',
          tags: ['Jobs'],
        },
      }
    )
    .delete(
      '/:id',
      async ({ params: { id } }) => {
        await jobsService.deleteJob(id);
        return { success: true, message: 'Job deleted successfully' };
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          summary: 'Delete job by ID',
          tags: ['Jobs'],
        },
      }
    );