import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { jobs, type Job, type NewJob } from './jobs.schema';
import { JobStatus } from './jobs.types';

export class JobsRepository {
  constructor(private db: PostgresJsDatabase<{ jobs: typeof jobs }>) {}

  async create(data: Omit<NewJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const [job] = await this.db.insert(jobs).values(data).returning();
    if (!job) {
      throw new Error('Failed to create job: insert operation did not return a record');
    }
    return job;
  }

  async findById(id: string): Promise<Job | null> {
    const [job] = await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);
    return job || null;
  }

  async findAll(filters?: { 
    status?: JobStatus; 
    department?: string;
    createdBy?: string;
  }): Promise<Job[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(jobs.status, filters.status));
    }
    
    if (filters?.department) {
      conditions.push(eq(jobs.department, filters.department));
    }

    if (filters?.createdBy) {
      conditions.push(eq(jobs.createdBy, filters.createdBy));
    }
    
    const query = this.db.select().from(jobs);
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async update(id: string, data: Partial<Omit<Job, 'id' | 'createdAt'>>): Promise<Job | null> {
    const [updated] = await this.db
      .update(jobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updated || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }

  async findPublished(): Promise<Job[]> {
    return await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.status, JobStatus.PUBLISHED));
  }
}
