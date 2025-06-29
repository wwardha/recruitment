import { pgTable, text, integer, timestamp, json, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { JobStatus, JobType } from './jobs.types';

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  requirements: json('requirements').$type<string[]>(),
  status: varchar('status', { length: 20, enum: Object.values(JobStatus) as [string, ...string[]] })
    .default(JobStatus.DRAFT).notNull(),
  jobType: varchar('job_type', { length: 20, enum: Object.values(JobType) as [string, ...string[]] })
    .default(JobType.POSTING).notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' })
    .defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;