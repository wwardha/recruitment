import { Elysia } from "elysia";
import { JobsService } from "./jobs.service";
import {
  CreateJobSchema,
  UpdateJobSchema,
  PublishJobSchema,
  ListJobsQuerySchema,
} from "./jobs.types";

export const createJobsRoutes = (jobsService: JobsService) =>
  new Elysia({ prefix: "/jobs" })
    .post(
      "/",
      async ({ body, set }) => {
        try {
          // TODO: Get user ID from auth context
          const userId = "temp-user-id";
          const data = CreateJobSchema.parse(body);
          const job = await jobsService.createJob(data, userId);
          set.status = 201;
          return { success: true, data: job };
        } catch (error) {
          set.status = 400;
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      {
        body: CreateJobSchema,
        detail: {
          summary: "Create a new job posting",
          tags: ["Jobs"],
        },
      },
    )
    .get(
      "/:id",
      async ({ params, set }) => {
        const { id } = PublishJobSchema.parse(params);
        const job = await jobsService.getJob(id);
        if (!job) {
          set.status = 404;
          return { success: false, error: "Job not found" };
        }
        return { success: true, data: job };
      },
      {
        params: PublishJobSchema,
        detail: {
          summary: "Get job by ID",
          tags: ["Jobs"],
        },
      },
    )
    .get(
      "/",
      async ({ query }) => {
        const filters = ListJobsQuerySchema.parse(query);
        const jobs = await jobsService.listJobs(filters);
        return { success: true, data: jobs };
      },
      {
        query: ListJobsQuerySchema,
        detail: {
          summary: "List jobs with optional filters",
          tags: ["Jobs"],
        },
      },
    )
    .put(
      "/:id",
      async ({ params, body, set }) => {
        const { id } = PublishJobSchema.parse(params);
        const data = UpdateJobSchema.parse(body);
        try {
          const updated = await jobsService.updateJob(id, data);
          if (!updated) {
            set.status = 404;
            return { success: false, error: "Job not found" };
          }
          return { success: true, data: updated };
        } catch (error) {
          set.status = 400;
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      {
        params: PublishJobSchema,
        body: UpdateJobSchema,
        detail: {
          summary: "Update job by ID",
          tags: ["Jobs"],
        },
      },
    )
    .post(
      "/:id/publish",
      async ({ params, set }) => {
        const { id } = PublishJobSchema.parse(params);
        try {
          const published = await jobsService.publishJob(id);
          return { success: true, data: published };
        } catch (error) {
          set.status = 400;
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      {
        params: PublishJobSchema,
        detail: {
          summary: "Publish a job",
          tags: ["Jobs"],
        },
      },
    )
    .post(
      "/:id/close",
      async ({ params, set }) => {
        const { id } = PublishJobSchema.parse(params);
        try {
          const closed = await jobsService.closeJob(id);
          return { success: true, data: closed };
        } catch (error) {
          set.status = 400;
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      {
        params: PublishJobSchema,
        detail: {
          summary: "Close a job",
          tags: ["Jobs"],
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, set }) => {
        const { id } = PublishJobSchema.parse(params);
        try {
          await jobsService.deleteJob(id);
          return { success: true, message: "Job deleted successfully" };
        } catch (error) {
          set.status = 400;
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      {
        params: PublishJobSchema,
        detail: {
          summary: "Delete job by ID",
          tags: ["Jobs"],
        },
      },
    );
