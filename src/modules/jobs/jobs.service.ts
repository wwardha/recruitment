import { JobsRepository } from './jobs.repository';
import { EventBus } from '@/shared/infrastructure/events';
import type { Job } from './jobs.schema';
import type { CreateJobInput, UpdateJobInput } from './jobs.types';
import { JobStatus } from './jobs.types';
import { createId } from '@/shared/utils/createId';
import {
  NotFoundError,
  ConflictError,
  DatabaseError,
} from '@/shared/infrastructure/errors';

export class JobsService {
  constructor(
    private repository: JobsRepository,
    private eventBus: EventBus
  ) {}

  async createJob(data: CreateJobInput, createdBy: string): Promise<Job> {
    const job = await this.repository.create({
      ...data,
      createdBy,
    });

    // Emit event for other modules
    this.eventBus.publish('job.created', {
      jobId: job.id,
      title: job.title,
      department: job.department,
      createdBy: job.createdBy,
      timestamp: new Date(),
      correlationId: createId(),
    });

    return job;
  }

  async getJob(id: string): Promise<Job> {
    const job = await this.repository.findById(id);
    if (!job) {
      throw new NotFoundError('Job');
    }
    return job;
  }

  async listJobs(filters?: { 
    status?: JobStatus; 
    department?: string;
    createdBy?: string;
  }): Promise<Job[]> {
    return this.repository.findAll(filters);
  }

  async updateJob(id: string, data: UpdateJobInput): Promise<Job> {
    const existingJob = await this.repository.findById(id);
    if (!existingJob) {
      throw new NotFoundError('Job');
    }

    const updated = await this.repository.update(id, data);

    if (updated) {
      this.eventBus.publish('job.updated', {
        jobId: updated.id,
        changes: data,
        timestamp: new Date(),
        correlationId: createId(),
      });
    }

    if (!updated) {
      throw new DatabaseError('Failed to update job');
    }

    return updated;
  }

  async publishJob(id: string): Promise<Job> {
    const job = await this.repository.findById(id);

    if (!job) {
      throw new NotFoundError('Job');
    }

    if (job.status !== JobStatus.DRAFT) {
      throw new ConflictError('Only draft jobs can be published');
    }

    const published = await this.repository.update(id, { status: JobStatus.PUBLISHED });

    if (!published) {
      throw new DatabaseError('Failed to publish job');
    }

    this.eventBus.publish('job.published', {
      jobId: published.id,
      title: published.title,
      department: published.department,
      publishedAt: new Date(),
      correlationId: createId(),
    });

    return published;
  }

  async closeJob(id: string): Promise<Job> {
    const job = await this.repository.findById(id);

    if (!job) {
      throw new NotFoundError('Job');
    }

    if (job.status !== JobStatus.PUBLISHED) {
      throw new ConflictError('Only published jobs can be closed');
    }

    const closed = await this.repository.update(id, { status: JobStatus.CLOSED });

    if (!closed) {
      throw new DatabaseError('Failed to close job');
    }

    this.eventBus.publish('job.closed', {
      jobId: closed.id,
      title: closed.title,
      closedAt: new Date(),
      correlationId: createId(),
    });

    return closed;
  }

  async deleteJob(id: string): Promise<void> {
    const job = await this.repository.findById(id);

    if (!job) {
      throw new NotFoundError('Job');
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new DatabaseError('Failed to delete job');
    }

    this.eventBus.publish('job.deleted', {
      jobId: id,
      title: job.title,
      deletedAt: new Date(),
      correlationId: createId(),
    });
  }

  // Public API for other modules
  async isJobOpen(id: string): Promise<boolean> {
    const job = await this.repository.findById(id);
    return job?.status === JobStatus.PUBLISHED;
  }

  async getPublishedJobs(): Promise<Job[]> {
    return this.repository.findPublished();
  }
}